function(context, args)//list:true
{
  if(!["implink", "dtr"].includes(context.caller)) return "Sorry, you're not invited."

  if(#s.scripts.get_level({name:context.this_script})!=4) {
      #s.chats.tell({to:"implink",msg:"`D"+context.this_script+" IS NOT FULLSEC. ABORTING WITHOUT CALLING ANYTHING. PLEASE REPORT THIS TO @implink OR @imphunter`"});
      return {ok:false}
  }
  #s.ada.haxfax({log:{c:context, a:args}})

  if (context.is_scriptor != null) {return "`A:::IMPLINK_COMMUNICATION:::` Messing with scripts is unlawful. Access denied."}

  let active = #s.users.active()

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
      "       `AAvilable Issues(s) :`",
      "       Issue #1 (11/20/2016):        read:1",
      "       Gril Interview (11/22/2016):  read:\"GRIL\"",
      "       Issue #2 (11/24/2016):        read:2",
      "       Issue #3 (12/06/2016):        read:3",
      "       pay.pal heist (12/07/2016):   read:\"pay\"\n",
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
  ];
    return listsign.join("\n")
  }

  //CORPS FOR INN
  function Corps(c)
  {
    let corp = #db.f({main:"news_network", type:"news_corps", id:c}).first()
    if (corp == null)
      return "Invalid Corp ID"

    return corp.text
  }
  if (args.corps)
    Corps(args.corps)

  function Article(art)
  {
    let article = #db.f({main:"news_network", id:art}).first()
    if (article == null)
      return "Invalid Article ID"

    article.text.replace('##VIEWS##', article.views).replace('##ACTIVE##', active).replace('##UPLINK##', article.uplink).replace('##DOWNLINK##', article.downlink)
  }

}
