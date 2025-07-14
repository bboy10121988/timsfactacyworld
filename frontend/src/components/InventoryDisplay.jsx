import React, { useState, useEffect } from 'react';

/**
 * 商品詳情頁中使用的庫存顯示元件
 * 展示如何從 Medusa v2 中獲取並顯示庫存信息
 */
const InventoryDisplay = ({ variantId, inventoryItemId }) => {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!inventoryItemId) {
        setLoading(false);
        setError('此變體未綁定庫存項目');
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/inventory-items/${inventoryItemId}/availability`
        );

        if (!response.ok) {
          throw new Error(`獲取庫存失敗: ${response.statusText}`);
        }

        const data = await response.json();
        setInventory(data);
        setLoading(false);
      } catch (err) {
        console.error('庫存查詢錯誤:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (inventoryItemId) {
      fetchInventory();
    }
  }, [inventoryItemId]);

  if (loading) return <div className="inventory-loading">正在加載庫存資訊...</div>;
  
  if (error) return <div className="inventory-error">無法獲取庫存: {error}</div>;
  
  if (!inventory) return <div className="inventory-unavailable">庫存資訊不可用</div>;

  // 判斷庫存狀態
  const isInStock = inventory.available_quantity > 0;
  const isLowStock = isInStock && inventory.available_quantity < 5; // 低庫存閾值
  
  return (
    <div className="inventory-display">
      {isInStock ? (
        <>
          {isLowStock ? (
            <span className="low-stock">庫存不多了！僅剩 {inventory.available_quantity} 件</span>
          ) : (
            <span className="in-stock">有庫存 ({inventory.available_quantity})</span>
          )}
        </>
      ) : (
        <span className="out-of-stock">缺貨中</span>
      )}
    </div>
  );
};

export default InventoryDisplay;
