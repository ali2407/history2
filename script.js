document.addEventListener('DOMContentLoaded', function() {
    // Get references to elements
    const addChartBtn = document.getElementById('add-chart-btn');
    const chartInput = document.getElementById('chart-input');
    const chartContainer = document.getElementById('chart-container');
    
    // Load data from localStorage if available (for each unique instance)
    loadFromLocalStorage();
    
    // Generate a unique ID for this instance
    let uniqueId = getUniqueId();
    
    // Handle clicking the "Add Chart" button
    addChartBtn.addEventListener('click', function() {
        chartInput.click();
    });
    
    // Handle file selection
    chartInput.addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Create an image element
                const img = document.createElement('img');
                img.src = e.target.result;
                
                // Clear chart container and add image
                chartContainer.innerHTML = '';
                chartContainer.appendChild(img);
                
                // Add a small overlay button to change the image
                const changeBtn = document.createElement('button');
                changeBtn.textContent = 'Change';
                changeBtn.className = 'change-chart-btn';
                changeBtn.style.position = 'absolute';
                changeBtn.style.bottom = '5px';
                changeBtn.style.right = '5px';
                changeBtn.style.fontSize = '13px';
                changeBtn.style.padding = '4px 8px';
                changeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                changeBtn.style.color = 'white';
                changeBtn.style.border = 'none';
                changeBtn.style.borderRadius = '3px';
                changeBtn.style.cursor = 'pointer';
                changeBtn.style.zIndex = '2';
                
                changeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    chartInput.click();
                });
                
                chartContainer.appendChild(changeBtn);
                
                // Save to localStorage
                saveToLocalStorage();
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Save content when it changes
    document.querySelectorAll('[contenteditable="true"]').forEach(element => {
        element.addEventListener('blur', saveToLocalStorage);
    });
    
    // Generate a unique ID for this instance if needed
    function getUniqueId() {
        if (!localStorage.getItem('card_unique_id')) {
            const id = 'card_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('card_unique_id', id);
            return id;
        }
        return localStorage.getItem('card_unique_id');
    }
    
    // Save all content to localStorage
    function saveToLocalStorage() {
        const data = {
            tradePair: document.querySelector('.trade-pair').innerText,
            tradeDate: document.querySelector('.trade-date').innerText,
            entryPrice: document.querySelector('.price-value').innerText,
            exitPrice: document.querySelectorAll('.price-value')[1].innerText,
            pnl: document.querySelector('.profit-value').innerText,
            chartImage: chartContainer.innerHTML,
            tags: Array.from(document.querySelectorAll('.tag')).map(tag => tag.innerText)
        };
        
        localStorage.setItem(`trade_card_${uniqueId}`, JSON.stringify(data));
    }
    
    // Load content from localStorage
    function loadFromLocalStorage() {
        const uniqueId = getUniqueId();
        const savedData = localStorage.getItem(`trade_card_${uniqueId}`);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                document.querySelector('.trade-pair').innerText = data.tradePair || 'BTC/USDT';
                document.querySelector('.trade-date').innerText = data.tradeDate || 'January 15, 2025';
                document.querySelector('.price-value').innerText = data.entryPrice || '$4,825';
                document.querySelectorAll('.price-value')[1].innerText = data.exitPrice || '$63,800';
                document.querySelector('.profit-value').innerText = data.pnl || data.profitLoss || '+1222.3%';
                
                if (data.chartImage && data.chartImage !== '') {
                    chartContainer.innerHTML = data.chartImage;
                    // Re-add click event to change button if it exists
                    const changeBtn = chartContainer.querySelector('.change-chart-btn');
                    if (changeBtn) {
                        changeBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            chartInput.click();
                        });
                    }
                }
                
                if (data.tags && data.tags.length === document.querySelectorAll('.tag').length) {
                    const tags = document.querySelectorAll('.tag');
                    data.tags.forEach((text, index) => {
                        if (tags[index]) tags[index].innerText = text;
                    });
                }
            } catch (e) {
                console.error('Error loading saved data', e);
            }
        }
    }
    
    // Enable clicking on tags to toggle active state
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', function(e) {
            // Only toggle if not editing text
            if (document.activeElement !== this) {
                this.classList.toggle('active');
                saveToLocalStorage();
                e.preventDefault(); // Prevent contenteditable focus
            }
        });
    });
});
