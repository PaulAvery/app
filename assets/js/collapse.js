document.addEventListener('scroll', function onscroll() {
	document.removeEventListener('scroll', onscroll);

	if(!sessionStorage.getItem('scrolled')) {
		sessionStorage.setItem('scrolled', true);
		document.body.classList.add('collapsed');
	}
});

document.addEventListener("DOMContentLoaded", function() {
	if(!sessionStorage.getItem('scrolled')) {
		document.body.classList.remove('collapsed');
	}
});
