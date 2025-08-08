export default function medusaError(error: any): never {
  console.error("處理錯誤:", error)
  
  try {
    if (error === null) {
      console.error("錯誤物件為 null")
      throw new Error("Null error received")
    } else if (error === undefined) {
      console.error("錯誤物件為 undefined")
      throw new Error("Undefined error received")
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.config && error.config.url) {
        try {
          const u = new URL(error.config.url, error.config.baseURL)
          console.error("Resource:", u.toString())
        } catch (e) {
          console.error("無法解析 URL:", error.config.url, error.config.baseURL)
        }
      }
      
      console.error("Response data:", error.response.data)
      console.error("Status code:", error.response.status)
      console.error("Headers:", error.response.headers)

      // Extracting the error message from the response data
      let message = "Unknown server error"
      try {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            message = error.response.data
          } else if (error.response.data.message) {
            message = error.response.data.message
          } else if (error.response.data.error) {
            message = error.response.data.error
          } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            // 處理 errors 數組
            message = error.response.data.errors.map((err: any) => {
              if (typeof err === 'string') return err;
              return err.message || err.error || JSON.stringify(err);
            }).join('; ');
          } else {
            try {
              message = JSON.stringify(error.response.data)
            } catch (jsonError) {
              console.error("無法序列化錯誤數據:", jsonError)
              message = "Error data cannot be serialized"
            }
          }
        }
      } catch (e) {
        console.error("無法解析錯誤訊息:", e)
      }

      throw new Error(message.charAt(0).toUpperCase() + message.slice(1))
    } else if (error.request) {
      // The request was made but no response was received
      console.error("無回應錯誤:", error.request)
      let requestInfo = "請求無回應"
      
      try {
        // 嘗試提取更多請求信息
        const requestDetails = []
        
        if (error.request.method) {
          requestDetails.push(`Method: ${error.request.method}`)
        }
        
        if (error.request.url || error.request.path) {
          requestDetails.push(`URL: ${error.request.url || error.request.path}`)
        }
        
        if (error.request.status) {
          requestDetails.push(`Status: ${error.request.status}`)
        }
        
        if (error.request.statusText) {
          requestDetails.push(`Status Text: ${error.request.statusText}`)
        }
        
        if (error.request.responseType) {
          requestDetails.push(`Response Type: ${error.request.responseType}`)
        }
        
        if (requestDetails.length > 0) {
          requestInfo = requestDetails.join(', ')
        } else {
          try {
            requestInfo = JSON.stringify(error.request)
          } catch (e) {
            requestInfo = "Request object cannot be stringified"
          }
        }
      } catch (reqErr) {
        console.error("提取請求詳情時發生異常:", reqErr)
      }
      
      throw new Error("No response received: " + requestInfo)
    } else if (error.message) {
      // Something happened in setting up the request that triggered an Error
      console.error("請求設置錯誤:", error.message)
      
      let errorDetails = error.message
      
      // 嘗試提取更多錯誤細節
      try {
        const errorInfo = []
        
        if (error.name) {
          errorInfo.push(`名稱: ${error.name}`)
        }
        
        if (error.code) {
          errorInfo.push(`代碼: ${error.code}`)
        }
        
        if (error.stack) {
          console.error("錯誤堆疊:", error.stack)
          // 不在顯示給用戶的錯誤信息中包含堆疊
        }
        
        if (error.config) {
          try {
            // 提取請求配置信息
            const configInfo = []
            
            if (error.config.url) {
              configInfo.push(`URL: ${error.config.url}`)
            }
            
            if (error.config.method) {
              configInfo.push(`Method: ${error.config.method}`)
            }
            
            if (error.config.headers) {
              // 只記錄標頭的鍵，不記錄值（可能包含敏感信息）
              configInfo.push(`Headers: ${Object.keys(error.config.headers).join(', ')}`)
            }
            
            if (configInfo.length > 0) {
              errorInfo.push(`配置: ${configInfo.join(', ')}`)
            }
          } catch (configErr) {
            console.error("提取配置詳情時發生異常:", configErr)
          }
        }
        
        if (errorInfo.length > 0) {
          errorDetails = `${error.message} (${errorInfo.join('; ')})`
        }
      } catch (detailErr) {
        console.error("提取錯誤詳情時發生異常:", detailErr)
      }
      
      throw new Error("Error setting up the request: " + errorDetails)
    } else {
      // Complete unknown error
      console.error("未知錯誤:", error)
      let errorInfo = "未知錯誤"
      
      // 嘗試詳細檢查錯誤物件
      try {
        if (error === null) {
          errorInfo = "錯誤為 null"
        } else if (error === undefined) {
          errorInfo = "錯誤為 undefined"
        } else if (typeof error === 'object') {
          // 嘗試提取所有可能的錯誤信息
          const errorProps = []
          for (const key in error) {
            try {
              let value = error[key]
              if (typeof value === 'object' && value !== null) {
                try {
                  value = JSON.stringify(value)
                } catch (jsonErr) {
                  value = `[無法序列化的 ${typeof value}]`
                }
              }
              errorProps.push(`${key}: ${value}`)
            } catch (propErr) {
              errorProps.push(`${key}: [無法讀取屬性]`)
            }
          }
          
          if (errorProps.length > 0) {
            errorInfo = errorProps.join(', ')
          } else if (Object.getPrototypeOf(error) === Object.prototype) {
            // 如果是普通物件但沒有可枚舉屬性
            errorInfo = "空物件"
          } else if (error instanceof Error) {
            // 如果是 Error 物件
            errorInfo = `${error.name}: ${error.message}`
            if (error.stack) {
              console.error("錯誤堆疊:", error.stack)
            }
          } else {
            try {
              errorInfo = JSON.stringify(error)
            } catch (jsonErr) {
              errorInfo = `[無法序列化的 ${typeof error}]`
            }
          }
        } else {
          errorInfo = String(error)
        }
      } catch (detailErr) {
        console.error("提取錯誤詳情時發生異常:", detailErr)
        errorInfo = "無法提取錯誤詳情"
      }
      
      throw new Error("Unknown error occurred: " + errorInfo)
    }
  } catch (e) {
    // 確保我們總是返回一個錯誤，即使在處理原始錯誤時發生了異常
    if (e instanceof Error) {
      throw e
    } else {
      console.error("處理錯誤時發生異常:", e)
      throw new Error("An error occurred while processing the original error")
    }
  }
}
