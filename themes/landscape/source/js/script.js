document.addEventListener("DOMContentLoaded", function(event) { 
  var fb = document.querySelectorAll('.fb')[0]
  var enlarged = false
  fb.onclick = function() {
    if (!enlarged) {
      fb.classList = 'fb enlarge'
      enlarged = true
    } else {
      fb.classList = 'fb'
      enlarged = false
    }
  }
})

