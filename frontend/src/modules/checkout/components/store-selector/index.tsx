import React, { useState, useEffect } from "react";

// 物流選項介面
interface LogisticsOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

// 選中門市資訊介面
interface SelectedStore {
  CVSStoreID?: string;
  CVSStoreName?: string;
  CVSAddress?: string;
  CVSTelephone?: string;
  logisticsSubType?: string;
}

interface StoreSelectionData {
  storeId: string;
  storeName: string;
  storeAddress: string;
  telephone?: string;
  logisticsSubType: string;
}

const StoreSelector: React.FC = () => {
  const [selectedLogistics, setSelectedLogistics] = useState<string>("FAMI");
  const [selectedStore, setSelectedStore] = useState<SelectedStore | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 物流選項
  const logisticsOptions: LogisticsOption[] = [
    {
      value: "FAMI",
      label: "全家便利商店",
      description: "全台據點最多，24小時營業",
      icon: "🏪"
    },
    {
      value: "UNIMART", 
      label: "7-ELEVEN",
      description: "全台最大便利商店連鎖",
      icon: "🏬"
    },
    {
      value: "HILIFE",
      label: "萊爾富",
      description: "社區型便利商店",
      icon: "🏪"
    },
    {
      value: "FAMIC2C",
      label: "全家店到店",
      description: "全家便利商店店到店服務",
      icon: "📦"
    },
    {
      value: "UNIMARTC2C",
      label: "7-ELEVEN交貨便",
      description: "7-ELEVEN超商交貨便",
      icon: "📦"
    },
    {
      value: "HILIFEC2C",
      label: "萊爾富店到店",
      description: "萊爾富便利商店店到店",
      icon: "📦"
    }
  ];

  // 開啟 ECPay 電子地圖
  const openEcpayMap = async () => {
    try {
      setIsLoading(true);
      console.log('🗺️ 開啟 ECPay 電子地圖:', selectedLogistics);

      // 檢測設備類型
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const device = isMobile ? 1 : 0;

      // 呼叫後端 API 生成電子地圖表單
      const response = await fetch('http://localhost:9000/store/ecpay/logistics-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': 'pk_6a5b6f62e29baea8089628c7713ce56a388c5944011f43fcf15b8837b00464b7'
        },
        body: JSON.stringify({
          logisticsSubType: selectedLogistics,
          device: device,
          extraData: JSON.stringify({ 
            timestamp: Date.now(),
            source: 'store-selector' 
          })
        })
      });

      const result = await response.json();
      console.log('📋 API 回應:', result);

      if (!result.success) {
        throw new Error(result.message || '電子地圖生成失敗');
      }

      // 建立隱藏的 iframe 來載入表單
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'ecpay_map_frame';
      document.body.appendChild(iframe);

      // 建立表單並提交
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = result.html;
      const form = tempDiv.querySelector('form');
      
      if (form) {
        // 針對 iOS 設備進行特殊處理
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          // iOS 設備開啟新頁面
          form.target = '_blank';
          form.style.display = 'none';
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
        } else {
          // 其他設備使用彈出視窗
          const mapWindow = window.open('', 'ecpay_map', 'width=800,height=600,scrollbars=yes,resizable=yes');
          if (mapWindow) {
            mapWindow.document.write(result.html);
            mapWindow.document.close();
          } else {
            // 如果彈出視窗被阻擋，改用新分頁
            form.target = '_blank';
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
          }
        }
      }

      // 清理 iframe
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1000);

    } catch (error: any) {
      console.error('❌ 開啟電子地圖失敗:', error);
      alert(`開啟電子地圖失敗: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 監聽來自 ECPay 的門市選擇結果
  useEffect(() => {
    const handleStoreSelection = (event: MessageEvent) => {
      console.log('📩 收到門市選擇訊息:', event);
      
      if (event.origin !== window.location.origin) {
        return; // 安全檢查：只接受同源訊息
      }

      if (event.data && event.data.type === 'ECPAY_STORE_SELECTED') {
        const storeData: StoreSelectionData = event.data.data;
        console.log('🏪 門市選擇完成:', storeData);
        
        setSelectedStore({
          CVSStoreID: storeData.storeId,
          CVSStoreName: storeData.storeName,
          CVSAddress: storeData.storeAddress,
          CVSTelephone: storeData.telephone,
          logisticsSubType: storeData.logisticsSubType
        });
      }
    };

    window.addEventListener('message', handleStoreSelection);
    return () => window.removeEventListener('message', handleStoreSelection);
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">選擇取貨方式</h3>
        
        <div className="space-y-3">
          {logisticsOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="logistics"
                value={option.value}
                checked={selectedLogistics === option.value}
                onChange={(e) => setSelectedLogistics(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={openEcpayMap}
          disabled={isLoading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isLoading ? '開啟地圖中...' : '🗺️ 選擇門市'}
        </button>
      </div>

      {selectedStore && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-green-800">已選擇門市</h4>
              <div className="text-sm text-green-700">
                <div className="font-medium">{selectedStore.CVSStoreName}</div>
                <div>門市編號: {selectedStore.CVSStoreID}</div>
                <div>地址: {selectedStore.CVSAddress}</div>
                {selectedStore.CVSTelephone && (
                  <div>電話: {selectedStore.CVSTelephone}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSelector;
