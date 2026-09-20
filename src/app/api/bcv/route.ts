import { NextResponse } from 'next/server';
import https from 'https';
import prisma from '@/lib/prisma';

// In-memory cache
let memCache: {
  rate: number;
  date: string;
  formatted: string;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function fetchFromBCV(): Promise<{ rate: number; date: string; formatted: string } | null> {
  return new Promise((resolve) => {
    try {
      const agent = new https.Agent({
        rejectUnauthorized: false,
        ciphers: 'DEFAULT@SECLEVEL=0',
      });

      const req = https.get(
        'https://www.bcv.org.ve/',
        {
          agent,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          timeout: 12000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              // Regex matching for BCV USD exchange rate
              const rateMatch = data.match(/id=["']dolar["'][\s\S]*?<strong[^>]*>\s*([0-9,.]+)\s*<\/strong>/i);
              const dateMatch = data.match(/Fecha Valor:\s*<span[^>]*>([^<]+)<\/span>/i);

              if (rateMatch && rateMatch[1]) {
                const rawRateStr = rateMatch[1].trim();
                // In VE format, dot is thousands separator and comma is decimal separator
                const cleanRate = parseFloat(rawRateStr.replace(/\./g, '').replace(',', '.'));

                if (!isNaN(cleanRate) && cleanRate > 0) {
                  const dateStr = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString('es-VE');
                  resolve({
                    rate: cleanRate,
                    date: dateStr,
                    formatted: `${rawRateStr} Bs./USD`,
                  });
                  return;
                }
              }
              resolve(null);
            } catch (parseErr) {
              console.error('BCV parse error:', parseErr);
              resolve(null);
            }
          });
        }
      );

      req.on('error', (err) => {
        console.error('BCV https connection error:', err.message);
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        console.error('BCV connection timed out');
        resolve(null);
      });
    } catch (e) {
      console.error('BCV fetch exception:', e);
      resolve(null);
    }
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('force') === 'true';

    // 1. Check in-memory cache if not forced
    const now = Date.now();
    if (!forceRefresh && memCache && now - memCache.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        ...memCache,
        source: 'cache_memory',
      });
    }

    // 2. Fetch live from BCV
    const liveData = await fetchFromBCV();

    if (liveData) {
      memCache = {
        ...liveData,
        timestamp: now,
      };

      // Persist to Prisma Setting table for offline / fallback resilience
      try {
        await prisma.setting.upsert({
          where: { key: 'bcv_rate' },
          update: { value: liveData.rate.toString() },
          create: { key: 'bcv_rate', value: liveData.rate.toString() },
        });
        await prisma.setting.upsert({
          where: { key: 'bcv_date' },
          update: { value: liveData.date },
          create: { key: 'bcv_date', value: liveData.date },
        });
        await prisma.setting.upsert({
          where: { key: 'exchange_rate' },
          update: { value: liveData.rate.toString() },
          create: { key: 'exchange_rate', value: liveData.rate.toString() },
        });
      } catch (dbErr) {
        console.error('Failed to save BCV rate to DB:', dbErr);
      }

      return NextResponse.json({
        ...liveData,
        source: 'bcv_live',
        timestamp: now,
      });
    }

    // 3. Fallback to DB cached rate
    const dbRate = await prisma.setting.findUnique({ where: { key: 'bcv_rate' } });
    const dbDate = await prisma.setting.findUnique({ where: { key: 'bcv_date' } });

    if (dbRate && dbRate.value) {
      const parsedRate = parseFloat(dbRate.value);
      if (!isNaN(parsedRate) && parsedRate > 0) {
        return NextResponse.json({
          rate: parsedRate,
          date: dbDate?.value || 'Reciente',
          formatted: `${parsedRate.toFixed(2)} Bs./USD`,
          source: 'database_cache',
          warning: 'No se pudo conectar en tiempo real a BCV, usando última tasa oficial guardada',
        });
      }
    }

    // 4. Fallback to general exchange_rate
    const generalRate = await prisma.setting.findUnique({ where: { key: 'exchange_rate' } });
    const fallbackRate = generalRate?.value ? parseFloat(generalRate.value) : 60;

    return NextResponse.json({
      rate: fallbackRate,
      date: new Date().toLocaleDateString('es-VE'),
      formatted: `${fallbackRate.toFixed(2)} Bs./USD`,
      source: 'default_fallback',
    });
  } catch (error: any) {
    console.error('BCV API error:', error);
    return NextResponse.json(
      { error: 'Error al consultar la tasa BCV', details: error?.message },
      { status: 500 }
    );
  }
}
