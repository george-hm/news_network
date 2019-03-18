function(context, args)//list:true
{
  let I = #s.implink.lib()
  I.logData(context.calling_script, context.is_scriptor, args)

  let promo=#db.f({type:"inn_promotions"}).first();
  let notif = ""
  if(!promo)
    #db.i({type:"inn_promotions",users:[]});

  if (!promo.users.includes(context.caller)) {
    #s.jade.vita({api:{api_user:"implink",api_pass:"REDACTED", transfer:context.caller, amount:"50MGC", msg:"`AINN` promotion!"}})
    #db.u1({type:"inn_promotions"},{$addToSet:{users:context.caller}})
    notif = "You have been awarded 50MGC as part of a special promotion! It has been transferred to your jade.vita account.\n"
  }

  if(#s.scripts.get_level({name:context.this_script})!=4) {
    return {ok:false, msg:"`DWARNING:` This script is not `LFULLSEC`! Aborting without running any code. Please report this to @implink or Imp#7404 on discord."}
  }

  if(context.calling_script||context.is_scriptor) {return{ok:false, msg: "`A:::IMPLINK_COMMUNICATION:::` Messing with scripts is unlawful. Access denied."}}

  let active = #s.users.active()
  let super_admins=["implink", "imphunter", "alice"]
  let lib = #s.scripts.lib()
  let admin_sign = [
    "       `AImplink News Network Admin Panel` v0.1.4",
    "`c======================================================`\n"
  ].join("\n")
  let admin_body = [
    "`LCOMMANDS:`",
    " `Vcreate` `c-` Create new `AINN` content.",
    "   `LArguments:`",
    "   `Nid` `c-` the article ID, this is used for `Nread`/`Ncorps` {`Cstring or number`}",
    "   `Ntitle` `c-` content title, this is shown in list:true {`Cstring`}",
    "     `DIMPORTANT:` If this is a corp ad, make sure you have colour codes. e.g. title:\"\`AINN\`\"",
    "   `Ncontent` `c-` the main body, this'll usually be really long {`Cstring or array of strings`}",
    "   `Ntype` `c-` the type of content, `Vcorp_ad` or `Varticle` {`Cstring`}\n",
    " `Vmembers` `c-` View `Ladmins` and `Dsuper admins` of `AINN`.\n",
    " `Vlist` `c-` list all the current `AINN` content, and if it is `LACTIVE` or `DINACTIVE`.\n",
    " `Vset` `c-` set `AINN` content to either `LACTIVE` or `DINACTIVE`",
    "   `LArguments:`",
    "   `Naction` `c-` are you `Vpull`ing (setting to inactive) or `Vpush`ing (setting to active)? {`Cstring`}",
    "   `Nid` `c-` the content ID {`Cstring`}",
    "   `Ntype` `c-` content type, either `Vcorp_ad` or `Varticle` {`Cstring`}\n",
    " `Vupdate` `c-` update `AINN` content, you can only do this to `DINACTIVE` content.",
    "   `LArguments:`",
    "   `Nid` `c-` the content ID {`Cstring`}",
    "   `Ntype` `c-` content type, either `Vcorp_ad` or `Varticle` {`Cstring`}",
    "   `Ncontent` `c-` the `Dnew` content to be updated. {`Cstring or array of strings`}\n",
    " `Vview` `c-` view `AINN` content, even if it's `DINACTIVE`",
    "   `LArguments:`",
    "   `Nid` `c-` the id of the content {`Cstring`}",
    "   `Ntype` `c-` is this a `Vcorp_ad` or `Varticle`? {`Cstring`}",
    "\n`TQuick note:`",
    "PLEASE do not create more work for me, you have been given admin rights",
    "because you are trusted with the role, `Ddo not` abuse this and mess",
    "up `AINN` for me, that just means I revert your mistakes, and you are out."
  ].join("\n")

  //LONG list of functions
  function dbAccess(id, type, active)
  {
    if (active == true)
      return #db.f({type:"news_network", content_type:type, id:id, active:true}).first()
    if (active == false)
      return #db.f({type:"news_network", content_type:type, id:id, active:false}).first()
    return #db.f({type:"news_network", content_type:type, id:id}).first()
  }

  function Admin()
  {
    return []
  }

  function SuperAdmin()
  {
    let actions=[
      "`DSUPER_ADMIN COMMANDS:`",
      " `Vadd_admin` `c-` add a new admin to `AINN`.",
      "   `LArguments:`",
      "   `Nuser` `c-` specify a username {`Cstring`}\n",
      " `Vremove_admin` `c-` remove an admin from `AINN`.",
      "   `LArguments:`",
      "   `Nuser` `c-` specify a username {`Cstring`}\n",
      " `Vstats` `c-` modify statistics such as view count or ratings.",
      "   `LArguments:`",
      "   `Nid` `c-` id of corp_ad or article {`Cstring`}",
      "   `Ntype` `c-` specify if a `Vcorp_ad` or `Varticle` {`Cstring`}",
      "   `Nstat_type` `c-` is this `Vuplink`, `Vdownlink` or `Vviews`? {`Cstring`}",
      "   `Namount` `c-` amount to change, this can be positive or negative {`Cnumber`}\n",
      " `Vremove` `c-` remove `AINN` content permanently.",
      "   `LArguments:`",
      "   `Nid` `c-` content id. {`Cstring`}",
      "   `Ntype` `c-` `Vcorp_ad` or `Varticle`. {`Cstring`}",
      ""
    ]
    actions.push(...Admin())
    return actions
  }

  function errMsg(msg)
  {
    return {ok:false, msg:"`DCRYPTIC ERROR `" + msg + " PLEASE NOTIFY IMPLINK"}
  }

  function AddAdmin(user)
  {//SUPER ADMIN FUNCTION
    if(!user)
      return {ok:false,msg:"Enter valid `Nname` to add to `AINN` admins"}

    if(! #s.users.last_action({name:user}))
      return {ok:false,msg:user+" is an invalid name"}

    let data=#db.f({type:"inn_admin_list"}).first();

    if(!data)
      #db.i({type:"inn_admin_list",admins:[]});

    #db.u1({type:"inn_admin_list"},{$addToSet:{admins:user}})

    return {ok:true, msg:"Admin " + user + " added to `AINN`."}
  }

  function RemoveAdmin(user)
  {//SUPER ADMIN FUNCTION
    if(!user)
      return {ok:false,msg:"Enter valid `Nname` to remove to `AINN` admins"}

    let data=#db.f({type:"inn_admin_list"}).first();

    if(!data)
      #db.i({type:"inn_admin_list",admins:[]});

    #db.u1({type:"inn_admin_list"},{$pull:{admins:user}})

    return {ok:true, msg:"Admin " + user + " removed from `AINN`."}
  }

  function ModStats(id, type, amount, stattype)
  {//SUPER ADMIN FUNCTION
    if (!id || !type || !amount || !stattype)
      return {ok:false, msg:"Missing keys. Make sure you have `Nid`, `Ntype`, `Nchange` and `Namount`"}

    if (typeof type !== "string")
      return {ok:false,msg:"`Ntype` must be a string."}

    if (typeof id != "string" && typeof id != "number")
      return {ok:false, msg:"`Nid` must be a string or number."}

    if (typeof amount != "number")
      return {ok:false, msg:"`Namount` must be a number."}

    if (typeof stattype != "string")
      return {ok:false, msg:"`Nstat_type` must be a string."}

    if (stattype != "uplink" && stattype != "downlink" && stattype != "views")
      return {ok:false, msg:"`Nchange` can only be `Vuplink`, `Vdownlink` or `Vviews`"}

    if (!dbAccess(id, type))
      return {ok:false, msg:type + " does not exist. Ya idiot."}

    let obj = {
    	type: "news_network",
    	id: id,
    	content_type: type
    }

    if (amount < 0) obj[stattype] = {$gte: -amount}

    if (!#db.f(obj).first())
      return {ok:false, msg:"Cannot set a value below 0."}

    #db.u1(obj, {
    	$inc: {
    		[stattype]: amount
    	},
    	$set: {
    		date_updated: Date.now()
    	}
    })

    return {ok:true, msg:"`LRESULT:`\n" + type + " " + id + " had " + stattype + " changed by " + amount}
  }

  function viewContent(id,type)
  {
    if (!dbAccess(id, type))
      return {ok:false, msg:"Invalid Search."}

    return {ok:true, msg:dbAccess(id, type).content}
  }

  function updateContent(id, type, content)
  {
    if (!id || !type)
      return {ok:false, msg:"Missing keys, check help page."}

    if (!dbAccess(id, type, false))
      return {ok:false, msg:"Invalid search."}

    if (typeof content !== "string" && !Array.isArray(args.content))
      return {ok:false,msg:"`Ncontent` must be a string or array of strings"}

    #db.u1({
    	type: "news_network",
    	id: id,
    	content_type: type
    }, {
    	$set: {
    		content: content,
        date_updated: Date.now()
    	}
    })

    return {ok:true, msg:type + " " + id + " updated with new content."}
  }

  function resetContent(id, type)
  {//SUPER_ADMIN FUNCTION
    if (!dbAccess(id, type))
      return {ok:false, msg:"Invalid search."}

    #db.u1({
    	type: "news_network",
    	id: id,
    	content_type: type
    }, {
    	$set: {
    		voters: [],
    		uplink: 0,
    		downlink: 0,
    		views: 0,
        date_updated: Date.now()
    	}
    })
    return {ok:true, msg:"You have just reset all the views, voters and ratings of " + type + " " + id + " on `AImplink News Network.`"}
  }

  function removeContent(id, type)
  {//SUPER_ADMIN FUNCTION
    if (!dbAccess(id, type))
      return {ok:false, msg:"Invalid search."}

    #db.r({type:"news_network", id:id, content_type:type})
    return {ok:true, msg:"Successfuly `Dremoved` " + args.type + " " + args.id + " from `AImplink News Network`."}
  }

  function contentList()
  {
    let active = #db.f({type:"news_network", active:true}).sort({date_uploaded:1}).array()
    let inactive = #db.f({type:"news_network", active:false}).sort({date_uploaded:1}).array()
    let ret = [
      "   `AImplink News Network Content List`",
      "`c==========================================`",
      "`LACTIVE` content:\n\n" + active.map(p => "`HID` - " + p.id + "\n`TType` - " + p.content_type + "\n`AViews` - " + p.views + "\n`LUplinks` - " + p.uplink + "\n`DDownlinks` - " + p.downlink + "\n").join("\n"),
      "\n`c==========================================`",
      "`DINACTIVE` content:\n\n" + inactive.map(p => "`HID` - " + p.id + "\n`TType` - " + p.content_type + "\n`AViews` - " + p.views + "\n`LUplinks` - " + p.uplink + "\n`DDownlinks` - " + p.downlink + "\n").join("\n"),
      "\n`TSUMMARY:`",
      "`LACTIVE` content is what appears on list:true.",
      "By default, all new `AINN` content is marked as `DINACTIVE`,",
      "this is to prevent mistakes such as typos etc.",
      "\n`DINACTIVE` is what the user cannot see, you need to mark this content",
      "as `LACTIVE` if you want the user to be able to see it."
    ].join("\n")
    return ret
  }

  function activeSet(acttype, id, type)
  {
    if (acttype == "push") {
      if (!dbAccess(id,type))
        return {ok:false, msg:"Invalid search."}
      if (dbAccess(id, type).active == true)
        return {ok:false, msg:type + " " + id + " is already `LACTIVE`, perhaps you meant `Npull`?"}

      #db.u1({
      	type: "news_network",
      	id: id,
      	content_type: type
      }, {
      	$set: {
      		active: true,
      		date_updated: Date.now()
      	}
      })

      return {ok:true, msg:"Successfully pushed " + type + " " + id  + " from `AINN`, it is now `LACTIVE`"}
    }
    else if (acttype == "pull") {
      if (!dbAccess(id,type))
        return {ok:false, msg:"Invalid search."}
      if (dbAccess(id, type).active == false)
        return {ok:false, msg:type + " " + id + " is already `DINACTIVE`, contact a super admin\nif you think this content should be removed permanently from `AINN`."}

      #db.u1({
      	type: "news_network",
      	id: id,
      	content_type: type
      }, {
      	$set: {
      		active: false,
      		date_updated: Date.now()
      	}
      })

      return {ok:true, msg:"Successfully pulled " + type + " " + id + " from `AINN`, it is now `DINACTIVE`"}
    }
    else
      return {ok:false, msg:"`Naction` must be either `Vpush` or `Vpull`"}
  }


  function Corps(c)
  {
    let corp = dbAccess(c, "corp_ad", true)
    if (!corp)
      return "Invalid Corp ID"

    if (corp) {
      #db.u1({
      	type: "news_network",
      	content_type: "corp_ad",
      	id: c
      }, {
      	$inc: {
      		views: 1
      	}
      })
      return notif + corp.content.join("\n")
    }
    else
      return errMsg("COR01")
  }

  function Article(art)
  {
    let article = dbAccess(art, "article", true)
    if (!article)
      return "Invalid Article ID"

    if (!args.m)
      #s.chats.send({channel:"0000", msg:"I just read article " + art + " at implink.news_network!"})

    #db.u1({
    	type: "news_network",
    	content_type: "article",
    	id: art
    }, {
    	$inc: {
    		views: 1
    	}
    })

    if (Array.isArray(article.content))
      return article.content.join("\n").replace('##VIEWS##', article.views).replace('##ACTIVE##', active).replace('##UPLINK##', article.uplink).replace('##DOWNLINK##', article.downlink) + "\n\n\n" + CommentList(art) + "\n\n\n" + notif

    else
      return article.content.replace('##VIEWS##', article.views).replace('##ACTIVE##', active).replace('##UPLINK##', article.uplink).replace('##DOWNLINK##', article.downlink) + "\n\n\n" + CommentList(art) + "\n\n\n" + notif
  }

  function Ratings(id, type)
  {
    let access = dbAccess(id, type, true)
    if (!access){return errMsg("RAT01")}

    if (args.rate !== "uplink" && args.rate !== "downlink")
      return "`LUplink` or `DDownlink` only."

    if (access.voters.indexOf(context.caller)>-1)
      return "You have already voted!"

    #db.u1({
    	type: "news_network",
    	content_type: type,
    	id: id
    }, {
    	$inc: {
    		[args.rate]: 1
    	},
    	$addToSet: {
    		voters: context.caller
    	}
    })
    return {ok:true, msg:"You have successfully "+args.rate+"ed article " + id}
  }

  function list()
  {
    let listsign = [
      "                             `ANEW AND IMPROVED!`",
      "   `A____           ___      __     _  __                 _  __    __                  __ ` ",
      "  `A/  _/_ _  ___  / (_)__  / /__  / |/ /__ _    _____   / |/ /__ / /__    _____  ____/ /__`",
      " `A_/ /\/  ' \\/ _ \\/ / / _ \\/  '_/ /    / -_) |/|/ (_-<  /    / -_) __/ |/|/ / _ \\/ __/  '_/`",
      "`A/___/_/_/_/ .__/_/_/_/\/_/_/\\_\\ /_/|_/\\__/|__,__/___/ /_/|_/\\__/\\__/|__,__/\\___/_/ /_/\\_\\` ",
      "         `A/_/`                                                                             ",
      "                    `ACurrent Active Users on hackmud:` " + active,
      "       `c=========================``PNEWS ISSUES``c=========================`",
      "       `AUse argument read:\"<num or name>\" to view articles`\n",
      "       `ARate content by adding rate:\"uplink\" or rate:\"downlink\"`",
      "       `Aat the end of 'read:\"<num or name>\"'`",
      "       `AAvilable Issues(s) :`\n" + artlist,
      "       `c==========================``LCORP ADS``c==========================`",
      "       `AUse argument corp:\"<corpname>\" to view corp adverts`\n",
      "       `ACorp Adverts on implink.news_network:`\n" + corplist,
      "       `c==========================``AJOB OFFERS``c==========================`",
      "       `DNOTICE:` Try and break `AINN`, if you manage to find a bug, report",
      "       it to @implink or Imp#7404 on discord for a reward.",
      "       `AJob offers will be revamped soon.`\n"
    ].join("\n");
    return notif + listsign

  }
  function AddNew(id, content, title, type)
  {
    if (!title || !id || !content || !type)
    return {ok:false, msg:"Missing keys. Make sure you have: `Ntitle`, `Nid`, `Ncontent` and `Ntype`"}

    if (dbAccess(id, type) !== null)
      return {ok:false, msg:type + " already exists on `AINN.`"}

    if (typeof title !== "string")
      return {ok:false,msg:"`Ntitle` must be a string."}

    if (typeof content !== "string" && !Array.isArray(args.content))
      return {ok:false,msg:"`Ncontent` must be a string or array of strings"}

    if (typeof id != "string" && typeof id != "number")
      return {ok:false, msg:"`Nid` must be a string or number."}

    if (type != "corp_ad" && type != "article")
      return {ok:false, msg:"Invalid `Ntitle`, `V\"corp_ad\"` or `V\"article\"` only."}

    #db.i({
      type: "news_network",
      id: id,
      content_type: type,
      title: title,
      voters: [],
      content: content,
      uplink: 0,
      downlink: 0,
      views: 0,
      active:false,
      date_uploaded: Date.now(),
      date_updated: Date.now()
    })

    return {ok:true, msg:type + " " + title + " added to `AINN`."}
  }

  function Donations(user, amount)
  {
    let num = lib.to_gc_num(amount)
    let data = #db.f({type:"inn_donation_list", donators:[]})
    if(! #s.users.last_action({name:user}))
      return {ok:false,msg:user+" is an invalid name"}
    if(!data)
      #db.i({
      	type: "inn_donation_list",
      	donators: []
      });
    if (typeof amount !== "string" && typeof amount !== "number")
      return "what the fuck are you doing"

    if (typeof amount === "string") {
      if (typeof num === "object")
        return "Invalid GC string."
    }
    if (typeof amount === "number") {
      if (typeof num == "object")
        return "Invalid amount."
    }//Could probably do this in a for loop?

    // #db.u1({type:"inn_donation_list"},{$addToSet:{donators:[user]:amount}})
    // TODO: probably doesnt work? need a way to check if amount is 0, if so, add user, if not, inc amount >.>
  }

  let inn_admins=#db.f({type:"inn_admin_list"}).first().admins
  function MemberList()
  {
    let names=inn_admins.join(",").split(",") // this is just making a copy of the list because we are going to mutate it
    names.push(...super_admins)
    let actions=[]
    let last_action={};
    while(names.length>50) {
      actions.push(...#s.users.last_action({name:names.splice(0,50)}));
    }
    actions.push(...#s.users.last_action({name:names}));
    for(let i=0;i<actions.length;++i) {
      if(actions[i])
        last_action[actions[i].n]=new Date(actions[i].t||0)/1
    }
    for(let i=0;i<inn_admins.length;++i) {
      if(!last_action[inn_admins[i]] || _START-last_action[inn_admins[i]]>20*24*3600*1000) {
        RemoveAdmin(inn_admins[i]);
        inn_admins.splice(i,1);
        --i;
      }
    }
    let sum = I.format.columns(super_admins.map(p =>({name:"`T# " + p + "`",la:"last active  -",last:I.format.formatTimeAgo(last_action[p])})),[{name:false,key:'name'},{key:"la"},{key:"last",dir:-1}],{pre:'',suf:'',sep:'  '},true)
    let sum2 = I.format.columns(inn_admins.map(p =>({name:"`T# " + p + "`",la:"last active  -",last:I.format.formatTimeAgo(last_action[p])})),[{name:false,key:'name'},{key:"la"},{key:"last",dir:-1}],{pre:'',suf:'',sep:'  '},true)
    let memlist = [
      "\n            `AImplink News Network Admin Member List:`",
      "`c=====================================================================`\n",
      "`ASUPER:`\n" + sum,
      "\n`LWhat can super admins do?`",
      "Usually control critical aspects such as adding and removing admins,",
      "changing view/rating counts and more.\n",
      "`c=====================================================================`\n",
      "`AREGULAR:`\n" + sum2
    ].join("\n")
    return memlist
  }

  function BlackList(str, ban)
	{
		for(let i of ban) {
			if(str.includes(i))
				return {ok:false, msg:"Message contains blacklisted character: " + i};
		}
		return true;
	}

	function SpaceOnly(str)
	{
		return !(str.split("").filter(x=>x===" ").length);
	}

	function MakeComment(content, readid)
	{
		if (content.length > 30)
			return {ok:false, msg:"Your comment can not be longer than 30 characters."}

		if (BlackList(content, ["`", "\n"]) != true)
			return BlackList(content, ["`", "\n"])

		if (SpaceOnly(content))
			return {ok:false, msg:"Your comment is only spaces, not allowed."}

		let comment_id = l.create_rand_string(6)

		#db.i({
			type: "inn_comments",
			id: readid,
			comment_id: comment_id,
			user: context.caller,
			content: content,
			date_posted: Date.now()
		})

		return {ok:true, msg:"Your comment has been posted to " + readid + "!\nIf you wish to remove your comment do - implink.news_network{remove_comment:\"" + comment_id + "\"}"}
	}

	function RemoveComment(comment_id)
	{
		if(!comment_id)
			return {ok:false, msg:"Missing ID!"}

		let check = #db.f({type:"inn_comments", comment_id:comment_id})

		let admin = false
		if ((super_admins.includes(context.caller) || inn_admins.includes(context.caller)))
			admin == true

		if (!check)
			return {ok:false, msg:"Comment not found!"}

		if (admin == false) {
			if(check.user.indexOf(context.caller)>-1) return {ok:false, msg:"This isn't your comment! How did you even get this ID?!"}
		}

		#db.r({type:"inn_comments", comment_id:comment_id})
		return {ok:true, msg:"Comment removed. Poster: " + check.user + " || ID: " + check.id}
	}

	function CommentList(readid)
	{
		let comments = #db.f({
			type: "inn_comments",
			id: readid
		}, {
			_id: 0,
			date_uploaded: 1,
			content: 1,
			user: 1
		}).sort({
			date_uploaded: -1
		}).array()

		let sumcomments = I.format.columns(comments, [
			{name:"`PPoster`", key:"user", func:d=>'`P'+d+'`'},
			{name:"`CComment`", key:"content"}
		],{pre:"		", suf:"`A|`", sep:" `A|` "}, true)

		if (comments == null) {
			sumcomments == "		No one has commented here yet!"
		}
		return sumcomments
	}


  if (!args || Object.keys(args).length==0) {
    let banner = [
    "                           `A_____   ___   __`  ",
    "                          `A/  _/ | / / | / /`  ",
    "                          `A/ /\/  |/ /  |/ /`  ",
    "                        `A_/ /\/ /|  / /|  /`   ",
    "                       `A/___/_/ |_/_/ |_/`     ",
    "\n                     `AImplink News Network.`",
    "\n                  `AActive Users on hackmud:` " + active,
    "`c------------------------------------------------------------------`",
    "\nhackmud’s most comprehensive news and information publication.",
    "Featuring a variety of content ranging from up-to-date stories on",
    "current in-game events, to the juiciest gossip on all of your",
    "favourite users. Read interviews with top corp members and content",
    "creators, advertise your services, and stay informed. `AINN`.",

    "\n                   To view available info",
    "           Run implink.news_network{ list: true }\n",
    "        If you like `AINN` please consider supporting",
    "   us by running implink.donate ! Thanks for your support! `D<3`\n",
    "`c------------------------------------------------------------------`",
    "`ASpecial thanks to: (in order of amount donated)`",//THIS'LL SOON BE AUTO
    "`F1) @vdd`", //20BGC
    "`T2) @dtr`", //10BGC
    "`P3) @n00bish`", //10BGC
    "`L4) @amazon`", //5BGC
    "`A5) @gril`", // 3.1BGC
    ].join("\n");
    return notif + banner
  }


  //gets us the article lists, sort by date (add spaces to pre:"" for indenting)
  let articles = #db.f({
    type: "news_network",
    content_type: "article",
    active:true
  }, {
    _id: 0,
    id:1,
    title: 1,
    uplink: 1,
    downlink: 1,
    views: 1,
    date_uploaded: 1,
    active:true
  }).sort({
    date_uploaded: 1
  }).array()

  let artlist = I.format.columns(articles,[
    {name:"`AArticle`",key:"title"},
    {name:"`AUploaded`",key:"date_uploaded",dir:-1,func:d=>{
      var t=new Date(d);
      return [('0'+t.getDate()).slice(-2),('0'+(t.getMonth()+1)).slice(-2),t.getFullYear()].join('/')
    }},
    {name:"`AID`",key:"id",func:d=>'read:'+JSON.stringify(d)},
    {name:"`AViews`",key:"views",dir:-1},
    {name:"`AUp`",key:"uplink",dir:-1,func:d=>'`L+'+d+'`'},
    {name:"`ADown`",key:"downlink",dir:-1,func:d=>'`D-'+d+'`'}
  ],{pre:"       ",suf:"",sep:"  "},true)

  let corps = #db.f({
    type: "news_network",
    content_type: "corp_ad",
    active:true
  }, {
    _id: 0,
    title: 1,
    id: 1
  }).array().sort(
    (a,b)=>a.title.slice(2,-1)<b.title.slice(2,-1)?-1:1 //REMOVE COLOUR CODES
  );

  let corplist = I.format.columns(corps,[
    {name:"`ACorp`",key:"title"},
    {name:"`AID`",key:"id",func:d=>'corp:'+JSON.stringify(d)},
  ],{pre:"       ",suf:"",sep:"  "},true)

  if (args.list == true) {
    return list()
  }

  let rm = args.remove_comment
  if (rm)
    return RemoveComment(rm)

  //CORPS FOR INN
  if (args.corp)
    return Corps(args.corp)

  //ISSUES OF INN
  let r = args.read
  if (r){
    if (args.rate)
      return Ratings(r, "article")
    if (args.comment)
      return MakeCommment(args.comment, r)
    else
      return Article(r)
  }
  //ADMIN PANEL
  if (super_admins.includes(context.caller) && 'super_admin' in args) {
    switch (args.super_admin) {
      case "add_admin":
        return AddAdmin(args.user);
      case "remove_admin":
        return RemoveAdmin(args.user);
      case "stats":
        return ModStats(args.id, args.type, args.amount, args.stat_type)
      case "reset":
        return resetContent(args.id, args.type)
      case "remove":
        return removeContent(args.id, args.type)
      case "members":
        return MemberList();
      case "create":
        return AddNew(args.id, args.content, args.title, args.type)
      case "list":
        return contentList()
      case "set":
        return activeSet(args.action, args.id, args.type)
      case "update":
        return updateContent(args.id, args.type, args.content)
      case "view":
        return viewContent(args.id, args.type)
      default:
        return admin_sign + SuperAdmin().join("\n") +"\n" + admin_body
    }
  }

  if( (super_admins.includes(context.caller) || inn_admins.includes(context.caller)) && 'admin' in args) {
    switch (args.admin) {
      case "members":
        return MemberList();
      case "create":
        return AddNew(args.id, args.content, args.title, args.type)
      case "list":
        return contentList()
      case "set":
        return activeSet(args.action, args.id, args.type)
      case "update":
        return updateContent(args.id, args.type, args.content)
      case "view":
        return viewContent(args.id, args.type)
      default:
        return admin_sign + admin_body+"\n" + Admin().join("\n")
    }
  }
  else {
    return list()
  }
}
