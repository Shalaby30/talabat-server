
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('toggles-container');


  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      container.textContent = "لا يوجد تبويب نشط.";
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => (window.DATA ? window.DATA : {})
    });

    if (!results || !results[0] || !results[0].result) {
      container.textContent = "لم أتمكن من قراءة DATA من الصفحة. تأكد أن content.js محمّل.";
      return;
    }

    const DATA = results[0].result;
    const dataKeys = Object.keys(DATA);

    // Create global "Disable All" button handler
    const btnAll = document.getElementById('btn-all-off');
    if (btnAll) {
      btnAll.addEventListener('click', async () => {
        try {
          btnAll.disabled = true;
          btnAll.textContent = 'جاري الإيقاف...';

          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              if (typeof window.startAutoDisableAll === 'function') {
                window.startAutoDisableAll();
              } else if (typeof window.startAutoDisable === 'function') {
                // fallback: iterate keys if helper not present
                const keys = Object.keys(window.DATA || {});
                (async function () {
                  for (let k of keys) {
                    // eslint-disable-next-line no-undef
                    await window.startAutoDisable(k);
                    await new Promise(s => setTimeout(s, 800));
                  }
                })();
              } else {
                console.error('no startAutoDisableAll or startAutoDisable in page');
              }
            }
          });

        } catch (err) {
          console.error(err);
        } finally {
          btnAll.disabled = false;
          btnAll.textContent = 'إيقاف الكل';
        }
      });
    }

    if (dataKeys.length === 0) {
      container.textContent = "لا توجد مجموعات في DATA.";
      return;
    }

    dataKeys.forEach(key => {
      const toggleDiv = document.createElement('div');
      toggleDiv.className = 'item-toggle';

      const span = document.createElement('span');
      span.className = 'txt';
      span.textContent = key;

      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'button-group';

      const btnOn = document.createElement('button');
      btnOn.className = 'btn btn-on active';
      btnOn.textContent = 'On';

      const btnOff = document.createElement('button');
      btnOff.className = 'btn btn-off';
      btnOff.textContent = 'Off';

      buttonGroup.appendChild(btnOn);
      buttonGroup.appendChild(btnOff);

      toggleDiv.appendChild(span);
      toggleDiv.appendChild(buttonGroup);

      btnOn.addEventListener('click', async () => {
        try {
          btnOn.classList.add('active');
          btnOff.classList.remove('active');
          // Enable items
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (dataKey) => {
              if (typeof window.startAutoEnable === 'function') {
                window.startAutoEnable(dataKey);
              } else {
                console.error("startAutoEnable غير موجود في الصفحة");
              }
            },
            args: [key]
          });
        } catch (err) {
          console.error("فشل استدعاء الدالة:", err);
        }
      });

      btnOff.addEventListener('click', async () => {
        try {
          btnOff.classList.add('active');
          btnOn.classList.remove('active');

          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (dataKey) => {
              if (typeof window.startAutoDisable === 'function') {
                window.startAutoDisable(dataKey);
              } else {
                console.error("startAutoDisable غير موجود في الصفحة");
              }
            },
            args: [key]
          });
        } catch (err) {
          console.error("فشل استدعاء الدالة:", err);
        }
      });

      container.appendChild(toggleDiv);
    });

  } catch (err) {
    container.textContent = "حدث خطأ أثناء التحميل.";
  }
});