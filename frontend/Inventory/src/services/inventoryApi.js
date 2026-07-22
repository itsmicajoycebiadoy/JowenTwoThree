// src/services/inventoryApi.js
import { supabase } from './supabaseClient';

// Helper to handle Supabase errors
function handleSupabaseError(error) {
  const err = new Error(error.message || 'Database request failed');
  err.status = error.code || 500;
  err.payload = error;
  throw err;
}

function computeStatus(inStock) {
  if (inStock === 0) return 'OutOfStock';
  if (inStock <= 5) return 'Low';
  if (inStock <= 10) return 'NearingExpiration';
  return 'Good';
}

// Normalize a raw Supabase row
function normalizeItem(row) {
  if (!row) return null;

  console.log("Normalizing row:", row);

  const inStock = Number(row.current_stock ?? 0);

  return {
    id: row.id,
    name: row.item_name,
    category:
      row.inventory_categories?.category_name ??
      row.inventory_categories?.name ??
      '',
    inStock,
    status: computeStatus(inStock),
  };
}

// ======================
// FETCH INVENTORY
// ======================
export async function fetchInventory({ q, category } = {}) {
  try {
    console.log("Fetching inventory from Supabase...");

    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        inventory_categories(*)
      `);

    console.log("Supabase data:", data);
    console.log("Supabase error:", error);

    if (error) {
      handleSupabaseError(error);
    }

    let result = (data ?? []).map(normalizeItem);

    console.log("Normalized result:", result);

    if (typeof category === 'string' && category.trim()) {
      const normalizedCategory = category.trim();
      result = result.filter(
        (item) => item.category === normalizedCategory
      );
    }

    if (typeof q === 'string' && q.trim()) {
      const keyword = q.trim().toLowerCase();

      result = result.filter((item) => {
        return (
          item.name.toLowerCase().includes(keyword) ||
          String(item.id).toLowerCase().includes(keyword)
        );
      });
    }

    console.log("Final result:", result);

    return result;

  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
}

// ======================
// UPDATE INVENTORY
// ======================
export async function updateInventory(id, { quantity, reason, notes } = {}) {
  if (!id) {
    throw new Error("id is required");
  }

  const qty = Number(quantity);

  if (!Number.isFinite(qty)) {
    throw new Error("quantity must be a number");
  }

  if (!reason || !reason.trim()) {
    throw new Error("reason is required");
  }

  const { data: currentItem, error: fetchError } = await supabase
    .from("inventory_items")
    .select(`
      *,
      inventory_categories(*)
    `)
    .eq("id", id)
    .single();

  console.log("Current item:", currentItem);
  console.log("Fetch error:", fetchError);

  if (fetchError) {
    handleSupabaseError(fetchError);
  }

  const currentStock = Number(currentItem.current_stock ?? 0);
  const newStock = currentStock + qty;

  if (newStock < 0) {
    throw new Error("Insufficient stock.");
  }

  const { error: updateError } = await supabase
    .from("inventory_items")
    .update({
      current_stock: newStock,
    })
    .eq("id", id);

  console.log("Update error:", updateError);

  if (updateError) {
    handleSupabaseError(updateError);
  }

  const { error: movementError } = await supabase
    .from("inventory_movements")
    .insert({
      inventory_item_id: id,
      movement_type: qty > 0 ? "IN" : "OUT",
      quantity: Math.abs(qty),
      reference_type: "MANUAL",
      remarks: `${reason}${notes ? ` (${notes})` : ""}`,
    });

  console.log("Movement error:", movementError);

  return normalizeItem({
    ...currentItem,
    current_stock: newStock,
  });
}

export async function deductStock(id, quantity, reason = "Sale") {
  return updateInventory(id, {
    quantity: -Math.abs(quantity),
    reason,
    notes: `Deducted ${quantity} via sale`,
  });
}

export async function addStock(id, quantity, reason = "Restock") {
  return updateInventory(id, {
    quantity: Math.abs(quantity),
    reason,
    notes: `Added ${quantity} via restock`,
  });
}