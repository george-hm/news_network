function(context, args)//list:true
{
  #db.i({type:"implink_news_logger",context:context,args:args,date:Date.now()})
  if(!["implink", "dtr"].includes(context.caller)) return "Sorry, you're not invited."

  if(#s.scripts.get_level({name:context.this_script})!=4) {
      #s.chats.tell({to:"implink",msg:"`D"+context.this_script+" IS NOT FULLSEC. ABORTING WITHOUT CALLING ANYTHING. PLEASE REPORT THIS TO @implink OR @imphunter`"});
      return {ok:false}
  }

  if (context.is_scriptor != null) {return "`A:::IMPLINK_COMMUNICATION:::` Messing with scripts is unlawful. Access denied."}

  let active = #s.users.active()
  let super_admins=["implink", "imphunter"]
  let lib = #s.scripts.lib()
  //call dtrs shit
  let D = #s.dtr.lib()

  //LONG list of functions
  function dbAccess(id, type)
  {
    return #db.f({main:"news_network", type:type, id:id}).first()
  }

  function Admin()
  {
    let admin_header = [
      "     `AINN Admins`",
      "`c------------------------`",
      "`LKEYS:`",
      " `Vcreate_article` `c-` Create a new `AINN` article [`COPTIONAL`]",
      "   `LArguments:`",
      "   `Nid` `c-` the article ID, this is used for `Nread` [`CREQUIRED`]",
      "   `Ntitle` `c-` article title, this is shown in list:true [`CREQUIRED`]",
      "   `Ncontent` `c-` the article content, this'll usually be a super long string [`CREQUIRED`]\n",
      " `Vcreate_corp_ad` `c-` Create a new `AINN` corp ad [`COPTIONAL`]",
      "   `LArguments`",
      "   `Nid` `c-` the article ID, this is used for `Ncorps` [`CREQUIRED`]",
      "   `Ntitle` `c-` the full name of the corp, this is displayed in list:true [`CREQUIRED`]",
      "   `Ncontent` `c-` the corp ad content, this'll usually be a super long string [`CREQUIRED`]",
    ].join("\n")

    return admin_header
  }

  function SuperAdmin()
  {
    let actions=[
    "super_admin:\"add_admin\",name:\"username\" - add an admin",
    "super_admin:\"remove_admin\",name:\"username\" - remove an admin"
    ]
    actions.push(...Admin())
    return actions
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

    return {ok:true, msg:"Admin " + user + " removed to `AINN`."}
  }

  function ModStats(id, type, amount, stattype)
  {//SUPER ADMIN FUNCTION
    if (!id || !type || !amount || !stattype)
      return {ok:false, msg:"Missing keys. Make sure you have `Nid`, `Ntype`, `Namount` and `Nchange`"}

    if (typeof type !== "string")
      return {ok:false,msg:"`Ntype` must be a string."}

    if (typeof id != "string" && typeof id != "number")
      return {ok:false, msg:"`Nid` must be a string or number."}

    if (typeof amount != "number")
      return {ok:false, msg:"`Namount` must be a number."}

    if (!dbAccess(id, type, stattype))
      return {ok:false, msg:type + " does not exist."}

    if (amount)
    {
    	#db.u1({
    		main: "news_network",
    		id: id,
    		type: type,
    	}, {
    		$inc: {
    			[stattype]: amount,
    		}
    	}, {
    		$set: {
    			date_updated: Date.now()
    		}
    	})
    }

    return {ok:true, msg:"`LRESULT:`\n" + statype + " changed by: " + amount}
  }

  function Corps(c)
  {
    corp = dbAccess(c, "corp_ad")
    if (!corp)
      return "Invalid Corp ID"
    if (corp) {
      #db.u1({main:"news_network", type:"corp_ad", id:c}, {$inc: {views:1}})
      return corp.text
    }
    else
      return {ok:false, msg:"`DCRYPTIC ERROR COR01 PLEASE NOTIFY IMPLINK`"}
  }

  function Article(art)
  {
    let article = dbAccess(art, "article")
    if (!article)
      return "Invalid Article ID"

    if (!args.m) {
      #s.chats.send({channel:"0000", msg:"I just read article " + art + " at implink.news_network!"})
    }
    #db.u1({
    	main: "news_network",
    	type: "article",
    	id: art
    }, {
    	$inc: {
    		views: 1
    	}
    })
    return article.text.replace('##VIEWS##', article.views).replace('##ACTIVE##', active).replace('##UPLINK##', article.uplink).replace('##DOWNLINK##', article.downlink)
  }

  function Ratings(id, type)
  {
    if (args.rate !== "uplink" && args.rate !== "downlink")
      return "`LUplink` or `DDownlink` only."

    let access = dbAccess(id, type)
    if (!access){return "`DCRYPTIC ERROR RAT01 PLEASE NOTIFY IMPLINK`"}
    if (access.indexOf(context.caller))
      return "You have already voted!"

    #db.u1({
    	main: "news_network",
    	type: type,
    	id: id
    }, {
    	$inc: {
    		[args.rate]: 1
    	}
    }, {
    	$addToSet: {
    		voters: context.caller
    	}
    })
    return "You have successfully "+args.rate+"ed artice " + id
  }

  function AddNew(id, content, title, type)
  {
    if (dbAccess(id, type) !== null) return type + " ad already exists."

    if (!title || !id || !content) {
      return "Missing keys. Make sure you have: `Ntitle`, `Nid` and `Ncontent`"
    }
    for (let th of [id, title, content]) {
      if (!args[th]) return{ok:false, msg:th + " cannot be null."}
    }
    if (typeof title !== "string")
      return {ok:false,msg:"`Ntitle` must be a string."}

    if (typeof content !== "string" && !Array.isArray(args.content))
      return {ok:false,msg:"`Ncontent` must be a string or array of strings"}

    if (typeof id != "string" && typeof id != "number")
      return {ok:false, msg:"`Nid` must be a string or number."}

    #db.i({
      main: "news_network",
      id: id,
      type: type,
      title: title,
      voters: [],
      text: content,
      uplink: 0,
      downlink: 0,
      views: 0,
      date_uploaded: Date.now(),
      date_updated: Date.now()
    })

    return type + " " + title + " added to `AINN`."
  }

  function Donations(user, amount)
  {
    if(! #s.users.last_action({name:user}))
    return {ok:false,msg:user+" is an invalid name"}
    // TODO: Finish this function
  }

  let inn_admins=#db.f({type:"inn_admin_list"}).first().admins
  function MemberList()
  {
    let names=inn_admins.join(",").split(",") // this is just making a copy of the list because we are going to mutate it
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
    let sum = super_admins.map(p => "`T# " + p + "`").join('\n')
    let sum2 = inn_admins.map(p => "`T# " + p + "`").join('\n')
    return "`AINN Admin Member List:`\n`c----------------------`\n`ASUPER:`\n" + sum + "\n`c----------------------`\n`AREGULAR:`\n" + sum2
  }


  if (!args || Object.keys(args).length==0) {
    let banner = [
    "                         `D*UNDER CONSTRUCTION*`",
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
    "`ASpecial thanks to: (in order of amount donated)`",
    "`F1) @vdd`", //20BGC
    "`T2) @dtr`", //10BGC
    "`P3) @n00bish`", //10BGC
    "`L4) @amazon`", //5BGC
    "`A5) @gril`", // 3.1BGC
    ].join("\n");
    return banner
  }


  //gets us the article lists, sort by date (add spaces to pre:"" for indenting)
  let articles = #db.f({
    main: "news_network",
    type: "article"
  }, {
    _id: 0,
    title: 1,
    uplink: 1,
    downlink: 1,
    views: 1,
    date_uploaded: 1
  }).sort({
    date_uploaded: 1
  }).array()

  let artlist = D.columns(articles,[
    {name:"`AArticle`",key:"title"},
    {name:"`AUploaded`",key:"date_uploaded",dir:-1,func:d=>{
      var t=new Date(d);
      return [('0'+t.getDate()).slice(-2),('0'+(t.getMonth()+1)).slice(-2),t.getFullYear()].join('/')
    }},
    {name:"`AID`",key:"id",func:d=>'read:'+JSON.stringify(d)},
    {name:"`AViews`",key:"views",dir:-1},
    {name:"`AUp`",key:"views",dir:-1,func:d=>'`L+'+d+'`'},
    {name:"`ADown`",key:"views",dir:-1,func:d=>'`D-'+d+'`'}
  ],{pre:"       ",post:"",sep:"  "},true)

  if (args.list == true) {
    let listsign = [
      "                            `D*UNDER CONSTRUCTION*`",
      "   `A____           ___      __     _  __                 _  __    __                  __ ` ",
      "  `A/  _/_ _  ___  / (_)__  / /__  / |/ /__ _    _____   / |/ /__ / /__    _____  ____/ /__`",
      " `A_/ /\/  ' \\/ _ \\/ / / _ \\/  '_/ /    / -_) |/|/ (_-<  /    / -_) __/ |/|/ / _ \\/ __/  '_/`",
      "`A/___/_/_/_/ .__/_/_/_/\/_/_/\\_\\ /_/|_/\\__/|__,__/___/ /_/|_/\\__/\\__/|__,__/\\___/_/ /_/\\_\\` ",
      "         `A/_/`                                                                             ",
      "                    `ACurrent Active Users on hackmud:` " + active,
      "       `c=========================``PNEWS ISSUES``c=========================`",
      "       `AUse argument read:\"<num or name>\" to view articles`\n",
      "       `ANEW: rate an article/issue with rate:\"uplink\" or rate:\"downlink\"`",
      "       `Aat the end of 'read:\"<num or name>\"'`",
      "       `AAvilable Issues(s) :`\n" + artlist,
      // "       Issue #1 (11/20/2016):        read:1",
      // "       Gril Interview (11/22/2016):  read:\"GRIL\"",
      // "       Issue #2 (11/24/2016):        read:2",
      // "       Issue #3 (12/06/2016):        read:3",
      // "       pay.pal heist (12/07/2016):   read:\"pay\"\n",
      "       `c==========================``LCORP ADS``c==========================`",
      "       `AUse argument corps:\"<corpname>\" to view corp adverts`\n",
      "       `ACorp Adverts on implink.news_network:`\n",
      "       `P(HAX) Hollow_Agent_eXperimentals: corps:\"HAX\"`",
      "       `J(ZDC) Zero_Day_Corp:              corps:\"ZDC\"`",
      "       `A(INN) Implink News Network:       corps:\"INN\"`",
      "       `Lgril_trust:                       corps:\"GRIL\"`",
      "       `Dmagma_asset_management:           corps:\"magma\"`",
      "       `LWonderland:                       corps:\"WL\"`\n",
      "       `c==========================``AJOB OFFERS``c==========================`",
      "       `AUse argument jobs:\"help\" for info on how to use the job board`\n",
      "       `AAvailable job offers, view with jobs:\"info\", id:\"id\"`\n\n",
      "\n       `c=========================``ASPONSORSHIP``c=========================`",
      "       Sponsored by n00bish.t2solver - the top t2 npc farming script!",
    ].join("\n");
    return listsign
  }


  //CORPS FOR INN
  if (args.corps)
    return Corps(args.corps)

  //ISSUES OF INN
  if (args.read)
    return Article(args.read)

  //ADMIN PANEL
  if (super_admins.includes(context.caller) && 'super_admin' in args) {
    if(args.super_admin=="add_admin")return AddAdmin(args.user);

    if(args.super_admin=="remove_admin")return RemoveAdmin(args.user);

    return admin_header+"\n"+ SuperAdmin().join("\n")
  }

  if( (super_admins.includes(context.caller) || inn_admins.includes(context.caller)) && 'admin' in args) {
    if (args.admin == "members")
      return MemberList();

    if (args.admin=="create_article")
      return AddNew(args.id, args.content, args.title, "article")

    if (args.admin == "create_corp_ad")
      return AddNew(args.id, args.content, args.title, "corp_ad")

    return admin_header+"\n" + Admin().join("\n")
  }
  else {
    return #s.implink.news_network({list:true})
  }
}
