//保存用户的数据，比如说有几个用户，当前用户的牌是什么之类的
var usersData = {
	userList : [],

	current : {
		//默认的底就是2
		price : 2,
		total : 0,
		nextId : null
	},

	lastWinner : null,

	currentList : [],

	cards : {},

	existUser : {},

	isStart : false,

	// 随机生成用户名
	getRandomName : function(){
		var str = '';
		for ( var i = 0; i < 10; i++ ) {
			str += String.fromCharCode( 65 + parseInt( Math.random() * 20 ) );
		}
		str += (new Date()).getTime();
		return str;
	}
};

var allCards = [];

allCards.sort( function(){
	return Math.random() - Math.random();
})

module.exports.userData = usersData;
// module.exports.allCards = allCards;
