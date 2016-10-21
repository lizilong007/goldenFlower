// 写一些辅助性的函数
var obj = {
	getIndex : function( arr, str ) {
		return arr.indexOf( str );
	},
	removeItem : function( arr, str ) {
		if ( Array.isArray( arr ) ) {
			var index = this.getIndex( arr, str );
			arr.splice( index, 1 );
		}else {
			delete arr[str];
		}
		
	},

	// 深度复制数组或是对象
	copy : function( arr ) {
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
	},

	//获取上一次的id值
	getPrev : function( arr, id ) {
		var index = arr.indexOf( id );
		if ( index === 0 ) {
			return arr[arr.length-1];
		}else {
			return arr[index-1];
		}
	},

	getNextId : function( arr, lastId ) {
		//如果不是新开局的话，返回下一位，否则返回第一个
		if ( lastId ) {
			var index = this.getIndex( arr, lastId );
			return arr[(index+1) % arr.length];
		}else {
			return arr[0];
		}
		
	},
	isEnd : function( arr ) {
		if ( arr.length === 1 ) {
			return true;
		}
		return false;
	},

	//洗牌并发牌
	//userData 是count_user里面的内容
	shuffle : function( userData ) {
		var data = userData.userData;

		data.existUser = {};
		data.cards = {};
		data.currentList = [];
		data.current = {
			//默认的底就是2
			price : 2,
			total : 0,
			nextId : null
		};

		allCards = (new Array( 52 ) ).join( ',' ).split( ',' ).map( function( item, index ) {
			return index + 1;
		});
		//打乱顺序
		allCards.sort( function(){
			return Math.random() - Math.random();
		});

		var len = data.userList.length;

		var lastWinner = data.lastWinner || data.userList[0];
		var index = this.getIndex( data.userList, lastWinner );
		// 开始发牌
		for ( var i = 0; i < len; i++ ) {
			data.currentList.push( data.userList[ (index+i) % len ]);
		}	

		for ( var i = 0; i < len * 3; i++ ) {
			if ( !data.cards[data.currentList[i % len]] )
				data.cards[data.currentList[i % len]] = [];
			data.cards[data.currentList[i % len]].push( allCards.shift() );
		}

		//标志比赛已经开始，不准任何人进入了
		data.isStart = true;
	},

	// 过滤掉掉线的用户
	filterLeftUser : function( data, userName ) {
		data.existUser[userName] = true;
	}

};


module.exports.pro = obj;
