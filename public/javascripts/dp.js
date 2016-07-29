
var newsIndex = 1;

function dp_news(n) {
	showDivs(newsIndex += n);
}

function showDivs(n) {
	var i;
	var x = document.getElementsByClassName("newsSlides");
	if (n > x.length) {
		newsIndex = 1;
	}
	if (n < 1) {
		newsIndex = x.length;
	}
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none";
	}
	x[newsIndex-1].style.display = "block";
}
