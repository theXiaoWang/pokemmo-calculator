document.addEventListener('DOMContentLoaded', function() {
    // Set default level to 50
    document.querySelectorAll('.level').forEach(function(input) {
        input.value = '50';
    });
    
    // Set the level-50 radio button as checked
    document.getElementById('default-level-50').checked = true;
}); 