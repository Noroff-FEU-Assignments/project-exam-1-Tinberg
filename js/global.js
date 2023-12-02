// Hamburger
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
//eventlistner click for hamburger
hamburger.addEventListener('click', function() {
    nav.classList.toggle('active');
    this.classList.toggle('active'); 
});
//Close hamburger menu when clicked outside menu/nav or hamburger div. 
document.addEventListener('click', function(event) {
    if (!nav.contains(event.target) && !hamburger.contains(event.target) && nav.classList.contains('active')) {
        nav.classList.remove('active');
    }
});

//Footer brand add class on hover
document.addEventListener('DOMContentLoaded', () => {
    const brandContainer = document.querySelector('.footer-brand-container');
    const tooltip = document.createElement('span');
    tooltip.classList.add('custom-tooltip');
    tooltip.textContent = 'Back to Top';
    brandContainer.appendChild(tooltip);
  
    // Position the tooltip relative to the brandContainer
    brandContainer.onmousemove = (e) => {
      tooltip.style.left = e.pageX + 'px';
      tooltip.style.top = e.pageY + 'px';
    };
  });

