import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_FILE = path.join(process.cwd(), 'prisma', 'expenses.json');

export interface ExpenseRecord {
  id: string;
  type: 'GASTO' | 'RECOMPRA' | 'PDV_VENTA' | 'VENTA_WEB' | 'RETIRO';
  description: string;
  amount: number; // In USD
  amountVes?: number;
  category?: string;
  supplier?: string;
  paymentMethod?: string;
  createdAt: string;
}

function getStoredExpenses(): ExpenseRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Default initial mock/demonstration expenses if none exists
      const initial: ExpenseRecord[] = [
        {
          id: 'exp-1',
          type: 'GASTO',
          description: 'Cinta de embalaje y bolsas delivery',
          amount: 14.50,
          category: 'Operativo',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: 'exp-2',
          type: 'RECOMPRA',
          description: 'Recompra stock Creatina Micronizada 300g',
          amount: 120.00,
          category: 'Inventario',
          supplier: 'NutriSupplies C.A.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        }
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading expenses.json:', err);
    return [];
  }
}

function saveStoredExpenses(expenses: ExpenseRecord[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing expenses.json:', err);
  }
}

// GET: Return all expenses
export async function GET() {
  try {
    const expenses = getStoredExpenses();
    return NextResponse.json({ expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add a new expense or operational cost
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, amount, type, category, supplier, paymentMethod, amountVes } = body;

    if (!description || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json(
        { error: 'Descripción y monto válido son requeridos.' },
        { status: 400 }
      );
    }

    const expenses = getStoredExpenses();
    const newExpense: ExpenseRecord = {
      id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      type: type || 'GASTO',
      description: description.trim(),
      amount: Math.abs(Number(amount)),
      amountVes: amountVes ? Number(amountVes) : undefined,
      category: category?.trim() || 'General',
      supplier: supplier?.trim() || undefined,
      paymentMethod: paymentMethod?.trim() || 'Efectivo/Transferencia',
      createdAt: new Date().toISOString(),
    };

    expenses.unshift(newExpense);
    saveStoredExpenses(expenses);

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an expense record
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const expenses = getStoredExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    saveStoredExpenses(filtered);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
