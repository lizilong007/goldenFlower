//发牌专用文件
//当服务器端已经洗好了牌并将其发过来的时候，使用js的运动特效来发牌
var cards = document.querySelectorAll( '.card' );

var socket = io.connect();
window.isGiveUp = false;
var userName = null;
var myCards = null;
var allCards = null;

//原始的金币数量
var money = 2000;

window.current = null;

window.isClickCompare = false;


//先不对用户进行登记入住了，采用随机数即可
// var userName = ( function(){
// 	var str;
// 	var isExist = true;
// 	str = prompt( '请输入你的昵称，让其他的玩家认识你：' + i );
// 	socket.emit( 'login', str );
// 	return str.trim();
// })();


;(function(){
	// 缓存卡片距左边的距离
	var cardLeft = cards[0].offsetLeft;

	// 卡片的宽度
	var cardWidth = 150;

	// 定义卡片之间的距离
	var cardsGap =100;

	// 容器的宽度
	var wraperWidth = 2 * ( cardLeft + cardWidth / 2);
	

	// move( cards[0], cardLeft + cardsGap );

	// 定义卡片移动的函数，因为不需要再y轴上移动，所以只需要一个left值即可
	function move( dom, posLeft ) {
		var timer = null;
		var left = 0;
		
		// 将卡片移到最右侧先
		for ( var i = 0; i < cards.length; i++ ) {
			//setStyle( cards[i], wraperWidth );
		}

		//1s之内完成一张卡片的移动
		timer = setInterval( function(){
			left += cardLeft / 100;

			if ( wraperWidth - left <= posLeft ) {
				setStyle( dom, posLeft );
				window.clearInterval( timer );
			}else{
				setStyle( dom, wraperWidth - left );
			}
			
		}, 10 );
	}

	function setStyle( dom, left ){
		dom.style.cssText = ';left:' + left + 'px;';
	}

	//集成发牌的运动效果的函数，其他的图片选择什么的放在其他的模块中即可
	window.showCards = function() {

		setStyle( cards[0], wraperWidth );
		setStyle( cards[1], wraperWidth );
		setStyle( cards[2], wraperWidth );

		move( cards[0], cardLeft - cardsGap );
		setTimeout( function(){
			move( cards[1], cardLeft );
		}, 1000 );
		setTimeout( function(){
			move( cards[2], cardLeft + cardsGap );
		}, 2000 );
	}
	// showCards();
})();

// 发牌之前的选择牌的图片的模块

/*(function(){
	//通过socket.io来获取是具体是那几张牌，其他的比如说谁先说话以后再打算
	//模拟一下牌这个数据
	window.myCards = (function () {
		var a = [];
		for ( var i = 0; i < 3; i++ ) {
			a.push( parseInt( Math.random() * 52 ) );
		}
		return a;
	})();
	myCards.forEach( function( item, index ) {
		cards[index].innerHTML = item;
	});
})();*/
