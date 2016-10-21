// 接收服务器的广播事件
socket.on( 'someOneLeft', function( content ){
	console.log( content )
});

//指定当前出牌的人
socket.on( 'cardOrder', function( content ) {
	console.log( content, userName, 'this is order' );
	if ( content !== userName ) {
		window.isGiveUp = true;
	}else {
		window.isGiveUp = false;
	}
});

socket.on( 'someoneWin', function( content ) {
	console.log( content + ' is winner!');
	window.isGiveUp = false;

	if ( content === window.userName ){
		alert( 'You win');
	}
});

socket.on( 'youGiveUp', function() {
	//弃牌之后就不能进行任何操作了，除非是离开页面
	console.log( 'You give up!' );
	window.isGiveUp = true;

	//将所有的按钮设置为不可按,或是提示一下
});


// 当用户连接进来的时候，返回它获得的用户名
socket.on( 'yourName', function( content ) {
	window.userName = content;
	console.log('this is your nick name in this game: ' + window.userName );
});


// 开赛或者是重新开赛，有服务器端返回各个成员的牌
socket.on( 'start', function( cardsInfo ) {
	window.myCards = cardsInfo[window.userName];
	window.allCards = cardsInfo;
	window.isGiveUp = false;

	window.myCards.forEach( function( item, index ) {
		window.cards[index].innerHTML = item;
	});

	//显示所有的用户的图片
	showAllUser( cardsInfo );

	document.querySelector( '#zongdujin' ).innerHTML = '总金币：0';
	document.querySelector( '#duzhu' ).innerHTML = '单次金币数：2';
	document.querySelector( '#state' ).innerHTML = '';

	window.showCards();
});

//当前的牌局情况——总的金币数、当前的倍数
socket.on( 'currentInfo', function( obj ) {
	window.current = obj;
	showTotal();
	function showTotal() {
		var price = window.current.price ? window.current.price : 2;
		var total = window.current.total ? window.current.total : 0;
		document.querySelector( '#zongdujin' ).innerHTML = '总金币：' + total;
		document.querySelector( '#duzhu' ).innerHTML = '单次金币数：' + price;
	}
});

socket.on( 'getResult', function( obj ) {
	if ( obj.loserName === userName ) {
		window.isGiveUp = true;
		document.querySelector( '#state' ).innerHTML = '已放弃';
		turnOnBrands( obj.winnerName );
	}else if( obj.winnerName === userName ) {
		turnOnBrands( obj.loserName );
	}
})


//显示所有的用户列表
function showAllUser( cardsInfo ) {
	// 显示所有的玩家的函数
	var wraper = document.querySelector( '.other' );

	var str = '';

	for ( var i in cardsInfo ) {
		if ( i !== window.userName )
			str += '<div class="single" id="' + i +
					// cardsInfo[i].join('*') + 
					'" style="background:url(./image/' + parseInt( Math.random()*4 + 1) +
					'.jpg' +
					'">' +
					'</div>'
	}

	wraper.innerHTML = str;
}

// 当需要看某一个用户的牌的时候，翻开这个用户的牌
function turnOnBrands( id ) {
	document.querySelector( '#' + id ).style.cssText = ';background:black;color:white;';
	document.querySelector( '#' + id ).innerHTML = window.allCards[id].join('*');
}
