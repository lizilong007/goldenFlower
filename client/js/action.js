// 扎金花的弃牌、加分、看牌的各种动作的响应
;(function (global) {

	document.addEventListener( 'click', clickHandle, false );
	document.addEventListener( 'click', compare, false );

	function keyDown(event){
		if ( event.keyCode === 116 )
	    	event.preventDefault();
	}
	// document.addEventListener( 'keydown', keyDown );
	
	function clickHandle( event ) {
		var tagName = event.target.tagName.toLowerCase();
		
		if ( tagName !== 'button' || window.isGiveUp ) {
			return;
		}
		// console.log( window.isGiveUp )
		var id = event.target.id;
		var obj = {
			cards : window.myCards
		};

		switch( id ) {
			case 'giveUp':
				send( socket, 'giveUp', obj );
				break;
			case 'double':
				send( socket, 'double', obj );
				break;
			case 'compare':
				window.isClickCompare = true;
				break;
			case 'goOn':
				send( socket, 'goOn', obj );
				break;

		}
	}

	// 弃牌的函数
	function send( socket, type, obj ) {
		// console.log( arguments )
		obj.id = window.userName;
		switch( type ) {
			case 'giveUp':
				socket.emit( 'giveUp', obj );
				document.querySelector( '#state' ).innerHTML = '已放弃';
				break;
			case 'double':
				socket.emit( 'double', obj );
				changeMoney(2);
				break;
			case 'compare':
				// socket.emit( 'compare', obj );
				window.isClickCompare = true;
				changeMoney(1);
				break;
			case 'goOn':
				changeMoney(1);
				socket.emit( 'goOn', obj );
				break;
		}
	}

	//更新自己的金币数量
	function changeMoney( type ) {
		var price;
		if ( type === 1 )
			price = window.current.price ? window.current.price : 2;
		else
			price = window.current.price * 2 > 16 ? 16 : window.current.price * 2;
		window.money -= price;
		document.querySelector( '.money' ).innerHTML = '金币剩余数：' + window.money;
	}
	

	function compare( event ) {
		//当用户点击任意一个对象进行比较的时候，进行比较
		var id = event.target.id;

		if ( window.isGiveUp && !window.isClickCompare ) {
			return;
		}

		window.isClickCompare = false;

		if ( /\d+/.test( id ) ){
			//对两者的数据进行排序
			turnOnBrands( id );

			//比较出来之后一定有一方要giveUp,使用emit来传递是谁赢了
			var result = getResult( window.allCards[userName], window.allCards[id] );
			var loser = result ? userName : id;
			var winner = result ? id : userName;

			// 向服务器通知一下谁赢了
			socket.emit( 'compareResult', {loserName :loser, winnerName:winner} );

			// 如果对方赢了，那么我就得在自己的页面上显示出我已经输了
			if( result ) {
				window.isGiveUp = true;
				document.querySelector( '#state' ).innerHTML = '已放弃';
				alert('You lose!Please wait for a second.');
			}
		}
	}

	//确定比较两者的大小了，arr1和arr2分别是两个存放三张牌的数组
	// 如果第一个赢，返回false， 第二个赢，返回true
	function getResult( arr1, arr2 ) {
		//从小到大排
		arr1.sort( function( a, b ) {
			return a - b;
		});
		arr2.sort( function( a, b ) {
			return a - b;
		});

		var result1 = getType( arr1 );
		var result2 = getType( arr2 );

		var compareResult;

		if ( result1 .flag > result2.flag ) {
			// console.log( 'winner is ' + arr1 );
			compareResult = false;
		}else if ( result1 .flag < result2.flag ) {
			// console.log( 'winner is ' + arr2 );
			compareResult = true;
		}else {
			// 如果第一个赢，返回false， 第二个赢，返回true
			compareResult = _getMax( arr1, arr2 );
		}

		return compareResult;
	}

	// 返回牌局的类型
	/* 0: 单牌
	 * 1: 对子
	 * 2：顺子
	 * 3：同花
	 * 4：同花顺
	 * 5: 豹子
	 */
	function getType( array ) {
		var result = {
			isDouble : isDouble( array ),
			isSameCards : isSameCards( array ),
			isSameColor : isSameColor( array ),
			isOrder : isOrder( array ),
			single : null,
			flag : -1
		};
		/* 0: 单牌
		 * 1: 对子
		 * 2：顺子
		 * 3：同花
		 * 4：同花顺
		 * 5: 豹子
		 */

		if ( result.isDouble ) 
			result.flag = 1;
		else if ( !result.isSameColor && result.isOrder ) 
			result.flag = 2;
		else if ( result.isSameColor && !result.isOrder )
			result.flag = 3;
		else if ( result.isSameColor && result.isOrder ) 
			result.flag = 4
		else if ( result.isSameCards )
			result.flag = 5;
		else {
			var arr = _copy( array );
			arr = arr.map( function( item ) {
				//当其为0的时候表示k
				return item % 13;
			});
			result.single = arr;
			result.flag = 0;
		}

		return result;
	}

	// 是不是对子
	function isDouble( array ) {
		//1~13  14~26  27~39  40~52
		var arr = _copy( array );
		arr = arr.map( function( item ) {
			//当其为0的时候表示k
			return item % 13;
		});

		return _unique( array );
	}

	//判断是否是豹子的情况
	function isSameCards( array ) {
		//1~13  14~26  27~39  40~52
		var arr = _copy( array );
		arr = arr.map( function( item ) {
			//当其为0的时候表示k
			return item % 13;
		});

		if ( arr[0] === arr[1] && arr[0] === arr[2] )
			return true;
		else
			return false;
	}


	//判断是否是同花的情况
	function isSameColor( array ) {
		//1~13  14~26  27~39  40~52
		var flag = false;
		var all = [
			[1,13], [14,26], [27,39], [40,52]
		];

		for ( var i = 0; i < 4; i++ ) {
			if ( _inRange( array, all[i] ) ) {
				flag = true;
				break;
			}
		}

		var arr = _copy( array );
		arr = arr.map( function( item ) {
			//当其为0的时候表示k
			return item % 13;
		});

		if ( flag ) {
			return arr;
		}else {
			return false;
		}
	}

	// 判断是否为顺子的情况
	function isOrder( array ) {
		// var flag = isSameColor( array );

		var arr = _copy( array );
		arr = arr.map( function( item ) {
			//当其为0的时候表示k
			return item % 13;
		});

		var result;
		if ( arr.indexOf(1) !== -1 ) {
			//第一个为A的情况下只有两种————123、QKA
			if ( arr[1] === 2 && arr[2] === 3 )
				result = true;
			else if( arr[2] === 12 && arr[0] === 0 )
				result = true;
			else
				result = false;
		}else if( arr[0] === 0 ) {
			if ( arr[1] === 11 && arr[2] === 12 )
				result = true;
		}else {
			if ( (arr[0] + 1) === arr[1] && (arr[1] + 1) === arr[2] )
				result = true;
			else
				result = false;
		}

		result = result ? result : false;
		if ( result ) {
			return arr;
		}else {
			return false;
		}
	}

	function _copy( arr ) {
		var result, i;
		if ( Array.isArray( arr ) ) {
			result = [];
			for( i = 0; i < arr.length; i++ ) {
				result.push( arr[i] );
			}
		}else {
			result = {};
			for ( i in arr ) {
				result[i] = arr[i];
			}
		}
		return result;
	}

	// 判断三个数据中有谁是两个的情况
	function _unique( array ) {
		var obj = {}, i = 0, len = array.length;

		for ( ; i < len; i++ ) {
			if ( !obj[array[i]] )
				obj[array[i]] = 1;
			else
				obj[array[i]]++;
		}

		var result = {}, isGet = false;

		for ( i in obj ){
			if ( obj[i] === 2 ) {
				isGet = true;
				result.double = i;
			}else{
				result.single = i;
			}
		}

		if ( !isGet )
			return false;
		else
			return result;
	}

	// 判断某个数组中的所有值是否在某一个数组的范围之内
	function _inRange( array1, array2 ) {
		var flag = true;
		for ( var i = 0; i < array1.length; i++ ) {
			if ( array1[i] < array2[0] || array1[i] > array2[1] ) {
				flag = false;
				break;
			}
		}
		return flag;
	}

	// 直接比较两个数组的大小
	// 如果第一个赢，返回false， 第二个赢，返回true
	function _getMax( arr1, arr2 ) {
		var arr1C = _copy( arr1 );
		var arr2C = _copy( arr2 );

		var i = 0;

		// 将0转变成13,1转变成14，防止比较出错
		for ( ; i < 3; i++ ) {
			if ( arr1C[i] === 0 )
				arr1C[i] = 13;
			else if ( arr1C[i] === 1 )
				arr1C[i] = 14;

			if ( arr2C[i] === 0 )
				arr2C[i] = 13;
			else if ( arr2C[i] === 1 )
				arr2C[i] = 14;
		}

		arr1C.sort( function( a, b ) {
			return a - b;
		});
		arr2C.sort( function( a, b ) {
			return a - b;
		});

		// console.log( arr1C, arr2C )

		//默认为第二个赢，如果两者相同的话，被敲的人赢
		i = 0, result = true;
		for ( ; i < 3; i++ ) {
			if ( arr1C[i] >  arr2C[i] ) {
				result = false;
				break;
			}
		}
		return result;
	}


})(window);
