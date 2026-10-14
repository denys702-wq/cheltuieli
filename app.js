/* ===== Raport erori (captură timpurie) ===== */
window.ERR=(function(){
 const EK='cheltuieli_err',MAX=30,NOISE=/ResizeObserver|network|offline|Failed to fetch|Load failed|NetworkError|unavailable|ERR_|AbortError|serviceWorker|sandboxed|permission-denied|Missing or insufficient permissions/i;
 let list=[],ses=0,busy=false,toasted=false;const crumbs=[];
 try{list=JSON.parse(localStorage.getItem(EK)||'[]');if(!Array.isArray(list))list=[]}catch(e){list=[]}
 const persist=()=>{try{localStorage.setItem(EK,JSON.stringify(list.slice(-MAX)))}catch(e){}};
 const ver=()=>{try{return APP_VER}catch(e){return '?'}};
 function snap(){
  const o={};
  try{o.tx=tx.length;o.pl=pl.length;o.subs=subs.length;o.cats=cats.length;o.goals=goals.length;o.per=per.length;o.lang=S.lang;o.cur=S.cur;o.tab=tab;o.scope=S.scope;o.cloud=C.hid?1:0;o.mode=C.mode;o.ym=mk(view)}catch(e){}
  try{o.sa=matchMedia('(display-mode: standalone)').matches?1:0;o.on=navigator.onLine?1:0;o.vw=innerWidth+'x'+innerHeight;o.sw=navigator.serviceWorker&&navigator.serviceWorker.controller?1:0}catch(e){}
  return o;
 }
 const clean=st=>String(st||'').split('\n').slice(0,7).map(l=>l.split(location.origin).join('').trim()).join('\n').slice(0,900);
 function refresh(){try{if(window.errRender&&document.getElementById('erp')&&!document.getElementById('erp').hidden)window.errRender()}catch(e){}}
 function flush(force){
  try{
   if(!force){let off=false;try{off=S.errAuto===false}catch(e){}if(off)return 0}
   if(!C||!C.fb||!C.uid)return 0;
   const F=C.fb.F,db=C.fb.db,q=list.filter(x=>!x.sent).slice(0,force?10:3);
   q.forEach(x=>{
    const d={id:x.id,t:x.t,k:x.k,v:x.v,m:x.m,s:x.s,l:x.l,c:x.c,st:x.st,ua:x.ua,n:x.n||1,u:C.uid};
    F.setDoc(F.doc(db,'errors',x.id),d).then(()=>{x.sent=1;persist();refresh()}).catch(()=>{});
   });
   return q.length;
  }catch(e){return 0}
 }
 const flushSoon=()=>setTimeout(()=>flush(false),1500);
 function report(kind,msg,stack,loc){
  try{
   if(busy)return;busy=true;
   msg=String(msg==null?'':msg).slice(0,300);
   if(kind!=='test'&&NOISE.test(msg))return;
   const st=clean(stack),fp=kind+'|'+msg+'|'+(loc||st.split('\n')[0]||''),now=Date.now();
   const e0=list.find(x=>x.fp===fp);
   if(e0){e0.n=(e0.n||1)+1;e0.t2=now;persist();return}
   if(ses>=20)return;ses++;
   list.push({id:now.toString(36)+Math.random().toString(36).slice(2,6),fp,t:now,k:kind,v:ver(),m:msg,s:st,l:String(loc||'').slice(0,60),c:crumbs.join('>'),st:JSON.stringify(snap()),ua:String(navigator.userAgent).slice(0,160),n:1,sent:0});
   persist();
   if(!toasted&&kind!=='test'){toasted=true;try{toast('<span style="font-size:24px">🛠️</span><span><b>'+t('erToastT')+'</b><small>'+t('erToastS')+'</small></span>',0)}catch(e){}}
   flushSoon();refresh();
  }catch(x){}finally{busy=false}
 }
 addEventListener('error',ev=>{
  if(ev.target&&ev.target!==window&&ev.target.tagName)return;
  const f=ev.filename||'';
  if(f&&f.indexOf(location.origin)!==0)return;
  if(!ev.error&&/^Script error/i.test(ev.message||''))return;
  report('js',ev.message,ev.error&&ev.error.stack,(ev.lineno||'')+':'+(ev.colno||''));
 },true);
 addEventListener('unhandledrejection',ev=>{const r=ev.reason;report('promise',r&&r.message||r,r&&r.stack,'')});
 function text(){
  const L=['=== Raport erori Cheltuieli v'+ver()+' ===','Generat: '+new Date().toISOString().slice(0,16).replace('T',' ')];
  list.slice().reverse().forEach((x,i)=>{
   L.push('','[#'+(i+1)+'] '+new Date(x.t).toISOString().slice(0,16).replace('T',' ')+' · '+x.k+' · v'+x.v+(x.n>1?' · x'+x.n:'')+' · '+(x.sent?'trimis':'netrimis'),'Mesaj: '+x.m);
   if(x.l)L.push('Loc: '+x.l);
   if(x.c)L.push('Acțiuni: '+x.c);
   L.push('Stare: '+x.st);
   if(x.s)L.push('Stack:',x.s);
   L.push('Dispozitiv: '+x.ua);
  });
  return L.join('\n');
 }
 return {report,flush,text,list:()=>list,crumb:a=>{crumbs.push(String(a).slice(0,24));if(crumbs.length>10)crumbs.shift()},clear:()=>{list=[];persist();refresh()},test:()=>report('test','Eroare de test '+new Date().toISOString().slice(11,19),'Error: test\n    at errtest (index.html)','manual')};
})();

const THEMES={teal:{h1:'#0b5f59',h2:'#12907f',a:'#0f766e',ad:'#2dd4bf',ond:'#06201c'},blue:{h1:'#1e3a8a',h2:'#2563eb',a:'#1d4ed8',ad:'#60a5fa',ond:'#08142e'},violet:{h1:'#4c1d95',h2:'#7c3aed',a:'#6d28d9',ad:'#a78bfa',ond:'#140a30'},orange:{h1:'#9a3412',h2:'#ea580c',a:'#c2410c',ad:'#fb923c',ond:'#2a1004'},rose:{h1:'#9f1239',h2:'#e11d48',a:'#be123c',ad:'#fb7185',ond:'#2f0612'}};
function applyTheme(){
 try{
  const th=THEMES[S.theme]||THEMES.teal;
  let el=document.getElementById('thm');if(!el){el=document.createElement('style');el.id='thm';document.head.appendChild(el)}
  el.textContent=`:root{--h1:${th.h1};--h2:${th.h2};--accent:${th.a}}@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--accent:${th.ad};--on:${th.ond}}}:root[data-theme="dark"]{--accent:${th.ad};--on:${th.ond}}.sum{box-shadow:0 10px 24px ${th.a}47}`;
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=th.h1;
  if(S.look==='light'||S.look==='dark')document.documentElement.dataset.theme=S.look;else delete document.documentElement.dataset.theme;
  const de=document.documentElement;if(S.fs&&S.fs!=='m')de.dataset.fs=S.fs;else delete de.dataset.fs;if(S.den&&S.den!=='n')de.dataset.den=S.den;else delete de.dataset.den;
 }catch(e){}
}
const CARDK=['today','tip','per','plan','ap','alert','settle','chart'];
const KEY='cheltuieli_v1',KEY2='cheltuieli_set',KEY3='cheltuieli_cloud',KEYQ='cheltuieli_apq';
const T={
ro:{app:'Cheltuieli',bal:'Sold',inc:'Venituri',exp:'Cheltuieli',list:'Tranzacții',stat:'Statistici',none:'Nicio tranzacție în această lună.<br>Apasă + ca să adaugi prima.',noexp:'Nicio cheltuială în această lună.',tot:'Total cheltuieli',last:'Luna trecută',nolast:'Nu există date pentru luna trecută.',e1:'Cheltuială',i1:'Venit',amt:'Sumă',cat:'Categorie',date:'Data',note:'Notă (opțional)',save:'Salvează',cancel:'Anulează',del:'Șterge',sure:'Sigur? Apasă din nou',eamt:'Introdu o sumă mai mare ca 0, de exemplu 25,50.',edate:'Alege data.',set:'Setări',lang:'Limbă',cur:'Monedă',curh:'Schimbarea monedei modifică doar afișarea, nu convertește sumele.',bk:'Backup și import',bkh:'Copiază textul și păstrează-l (de exemplu în Notițe). Pentru restaurare, lipește-l aici și apasă Importă.',copy:'Copiază',copied:'Copiat.',manual:'Selectează textul și copiază-l manual.',imp:'Importă din text',impsure:'Sigur? Înlocuiește datele',impok:'Importat: {n} tranzacții.',impbad:'Text invalid. Lipește tot backup-ul, exact cum a fost copiat.',close:'Închide',nostore:'Stocarea nu e disponibilă în acest browser. Datele se pierd la închidere; folosește Setări → Backup.',add:'Adaugă tranzacție',back:'Înapoi',done:'Gata',txt:'Tranzacție',nm:'Numele tău',nmp:'Cum te cheamă?',gm:'Bună dimineața',ga:'Bună ziua',ge:'Bună seara',hom:'Prezentare',his:'Istoric',spent:'din venituri',ofexp:'din cheltuieli',over:'Cheltuielile depășesc veniturile cu',left:'Rămas din venituri',noinc:'Nu ai venituri în această lună, deci procentele sunt calculate din cheltuieli.',top:'Cea mai mare cheltuială',p1:'De plătit',due:'Scadență',pl:'De plătit',plnone:'Nimic de plătit în această lună. Adaugă cu + și alege „De plătit” sau „Abonament”.',paid:'Plătit?',all:'Arată toate',sub1:'Abonament',due1:'Prima scadență',subh:'Se repetă lunar, începând cu luna datei alese. Modificările se aplică tuturor lunilor.',less:'Restrânge',late:'întârziat',prev:'Luna anterioară',next:'Luna următoare',more:'mai multe',avail:'disponibil'},
en:{app:'Expenses',bal:'Balance',inc:'Income',exp:'Expenses',list:'Transactions',stat:'Statistics',none:'No transactions this month.<br>Tap + to add the first one.',noexp:'No expenses this month.',tot:'Total expenses',last:'Last month',nolast:'No data for last month.',e1:'Expense',i1:'Income',amt:'Amount',cat:'Category',date:'Date',note:'Note (optional)',save:'Save',cancel:'Cancel',del:'Delete',sure:'Sure? Tap again',eamt:'Enter an amount above 0, for example 25.50.',edate:'Pick a date.',set:'Settings',lang:'Language',cur:'Currency',curh:'Changing the currency only changes how amounts are shown. It does not convert them.',bk:'Backup and import',bkh:'Copy the text and keep it somewhere safe (for example in Notes). To restore, paste it here and tap Import.',copy:'Copy',copied:'Copied.',manual:'Select the text and copy it manually.',imp:'Import from text',impsure:'Sure? This replaces your data',impok:'Imported: {n} transactions.',impbad:'Invalid text. Paste the whole backup exactly as it was copied.',close:'Close',nostore:'Storage is not available in this browser. Data is lost when you close it; use Settings → Backup.',add:'Add transaction',back:'Back',done:'Done',txt:'Transaction',nm:'Your name',nmp:'What should I call you?',gm:'Good morning',ga:'Good afternoon',ge:'Good evening',hom:'Overview',his:'History',spent:'of income',ofexp:'of expenses',over:'Expenses exceed income by',left:'Left from income',noinc:'No income this month, so percentages are based on expenses.',top:'Biggest expense',p1:'To pay',due:'Due date',pl:'Upcoming',plnone:'Nothing to pay this month. Tap + and choose “To pay” or “Subscription”.',paid:'Paid?',all:'Show all',sub1:'Subscription',due1:'First due date',subh:'Repeats every month, starting with the chosen date. Changes apply to all months.',less:'Collapse',late:'overdue',prev:'Previous month',next:'Next month',more:'more',avail:'available'}};
Object.assign(T.ro,{acc:'Cont și partener',accIn:'Autentificare',accUp:'Creează cont',email:'Email',pass:'Parolă',accOut:'Deconectare',hCreate:'Creează cămin comun',hJoin:'Intră cu cod',hCode:'Cod de invitație',hMine:'Codul tău de invitație',hWait:'Partenerul nu s-a alăturat încă. Trimite-i codul.',hSync:'Sincronizat în timp real',members:'Membri',signedAs:'Conectat ca {e}',a_intro:'Creează un cont (sau autentifică-te) ca să sincronizezi cu partenerul. Fiecare persoană are contul ei.',a_off:'Sincronizarea nu e disponibilă acum. Verifică internetul și redeschide aplicația.',a_load:'Se încarcă…',wait:'Un moment…',e_fill:'Completează emailul și parola.',e_cred:'Email sau parolă greșite.',e_used:'Există deja un cont cu acest email.',e_weak:'Parola e prea scurtă (minim 6 caractere).',e_mail:'Email invalid.',e_net:'Fără conexiune la internet.',e_code:'Cod invalid.',e_full:'Căminul are deja doi membri sau codul nu mai e valabil.',e_gen:'Eroare',sAll:'Toate',sMe:'Eu',sPartner:'Partener',sShared:'Comun',forWho:'Pentru',paidBy:'Plătit de',setT:'Decontare cheltuieli comune',sharedTot:'Total comun',even:'Cheltuielile comune sunt echilibrate.',oweMe:'{n} îți datorează {a}.',iOwe:'Îi datorezi {a} lui {n}.',syncErr:'Sincronizarea a întâmpinat o problemă. Ultima modificare poate să nu fi ajuns la partener.',copyCode:'Copiază codul'});Object.assign(T.en,{acc:'Account & partner',accIn:'Sign in',accUp:'Create account',email:'Email',pass:'Password',accOut:'Sign out',hCreate:'Create shared home',hJoin:'Join with code',hCode:'Invite code',hMine:'Your invite code',hWait:'Your partner has not joined yet. Send them the code.',hSync:'Synced in real time',members:'Members',signedAs:'Signed in as {e}',a_intro:'Create an account (or sign in) to sync with your partner. Each person has their own account.',a_off:'Sync is not available right now. Check your connection and reopen the app.',a_load:'Loading…',wait:'One moment…',e_fill:'Enter your email and password.',e_cred:'Wrong email or password.',e_used:'An account with this email already exists.',e_weak:'Password is too short (min 6 characters).',e_mail:'Invalid email.',e_net:'No internet connection.',e_code:'Invalid code.',e_full:'This home already has two members, or the code is no longer valid.',e_gen:'Error',sAll:'All',sMe:'Me',sPartner:'Partner',sShared:'Shared',forWho:'For',paidBy:'Paid by',setT:'Shared expenses settlement',sharedTot:'Shared total',even:'Shared expenses are balanced.',oweMe:'{n} owes you {a}.',iOwe:'You owe {n} {a}.',syncErr:'Sync ran into a problem. Your last change may not have reached your partner.',copyCode:'Copy code'});
Object.assign(T.ro,{budT:'Buget',today:'Azi',yday:'Ieri',bSpent:'Cheltuit din buget',ovBud:'Buget depășit la',bAdd:'Adaugă în buget',bInc:'Venituri luna asta',bNone:'Niciun venit adăugat în această lună.',addInc:'Adaugă venit',bAlloc:'Buget pe categorii',bFree:'Nealocat',bOver:'Alocat peste venituri cu',cAdd:'Categorie nouă',cNew:'Categorie nouă',cEdit:'Editează categoria',cName:'Nume',cEmoji:'Emoji',cBud:'Buget lunar',cHint:'Suma se aplică din luna afișată și în lunile următoare, până o schimbi.',cDel:'Șterge categoria',cDupe:'Există deja o categorie cu acest nume.',cEmpty:'Scrie un nume.',cBadAmt:'Suma nu e validă.',cOther:'Alte categorii (fără buget)',cLeft:'rămas',cOver:'depășit cu',cNoBud:'fără buget setat',mCommon:'Bani comuni',mSplit:'Bani împărțiți',mTitle:'Banii voștri',mCommonH:'Veniturile și bugetul sunt comune, într-un singur loc. Nu se calculează cine datorează cui.',mSplitH:'Fiecare are veniturile și bugetul lui. Cheltuielile marcate Comun se împart între voi.',ratio:'Cheltuielile comune se împart',ratioEq:'50% / 50%',ratioInc:'proporțional cu veniturile',splitInfo:'Împărțire: {a}% eu · {b}% {n}'});Object.assign(T.en,{budT:'Budget',today:'Today',yday:'Yesterday',bSpent:'Spent of budget',ovBud:'Over budget in',bAdd:'Add to budget',bInc:'Income this month',bNone:'No income added this month.',addInc:'Add income',bAlloc:'Budget by category',bFree:'Unallocated',bOver:'Allocated above income by',cAdd:'New category',cNew:'New category',cEdit:'Edit category',cName:'Name',cEmoji:'Emoji',cBud:'Monthly budget',cHint:'The amount applies from the month shown and onward, until you change it.',cDel:'Delete category',cDupe:'A category with this name already exists.',cEmpty:'Enter a name.',cBadAmt:'Invalid amount.',cOther:'Other categories (no budget)',cLeft:'left',cOver:'over by',cNoBud:'no budget set',mCommon:'Shared money',mSplit:'Split money',mTitle:'Your money',mCommonH:'Income and budget are shared, in one place. Nobody owes anybody.',mSplitH:'Each person has their own income and budget. Expenses marked Shared are split between you.',ratio:'Shared expenses are split',ratioEq:'50% / 50%',ratioInc:'in proportion to income',splitInfo:'Split: {a}% me · {b}% {n}'});
Object.assign(T.ro,{apm:'Apple Pay și reguli',apIntro:'Plățile cu Apple Pay se pot adăuga singure. Dacă aplicația nu recunoaște comerciantul, plata apare cu ❓ și o corectezi o dată; corecția se ține minte pentru plățile viitoare.',apLink:'Linkul de început',apCopy:'Copiază linkul',apRules:'Reguli învățate',apNoRules:'Încă nu există. Se creează singure când corectezi o plată Apple Pay.',apAdded:'Plată adăugată',apCheck:'Atinge ca să verifici',apUnk:'Comerciant necunoscut',apChkCard:'Plăți automate de verificat',apWait:'O plată Apple Pay așteaptă să fie salvată. Autentifică-te în ⚙ Cont și partener.',apDelQ:'Sigur?'});Object.assign(T.en,{apm:'Apple Pay & rules',apIntro:'Apple Pay payments can be added automatically. If the app does not recognise the merchant, the payment shows ❓ and you fix it once; the fix is remembered for future payments.',apLink:'Starting link',apCopy:'Copy link',apRules:'Learned rules',apNoRules:'None yet. They are created automatically when you correct an Apple Pay payment.',apAdded:'Payment added',apCheck:'Tap to review',apUnk:'Unknown merchant',apChkCard:'Automatic payments to review',apWait:'An Apple Pay payment is waiting to be saved. Sign in under ⚙ Account & partner.',apDelQ:'Sure?'});
Object.assign(T.ro,{apAT0:'x',apAT:'Varianta 1 · Automat cu Apple Pay (iOS 17 sau mai nou)',apA0:'0) Setări iPhone → Aplicații → Wallet → pornește Date mobile.\n1) iOS 17–26: Comenzi rapide → Automatizare → + → Transaction (pe iOS 26: Wallet) → alege cardurile → Run Immediately → New Blank Automation.\n    iOS 27: creează o comandă nouă, apoi Edit → Automation → Transaction, la „When I tap” alege Any Card. Apoi ⓘ → Privacy → pornește Allow Running When Locked.\n2) Prima acțiune: URL Encode. La input alege Shortcut Input și apasă pe el ca să alegi proprietatea Merchant.\n3) A doua acțiune: URL. Scrie linkul de sus (se termină cu ?amt=), adaugă Shortcut Input → proprietatea Amount, scrie &m= și adaugă rezultatul URL Encoded Text de la pasul 2 (Select Variable → bulina albastră de sub acțiune).\n4) A treia acțiune: Open URLs.\n5) Fă o plată de test.\nAtenție: nu codifica tot linkul, doar comerciantul, altfel ? & = / se strică.',apBT:'Varianta 2 · Manual, pe orice iOS',apB:'1) Comenzi rapide → fila Shortcuts → + (comandă nouă).\n2) Add Action → Ask for Input: tip Number, întrebare „Cât ai plătit?”.\n3) Încă un Ask for Input: tip Text, întrebare „Unde ai plătit?”.\n4) Add Action → URL Encode, cu rezultatul întrebării a doua (locul).\n5) Add Action → URL: linkul de sus (se termină cu ?amt=), variabila primei întrebări (suma), scrie &m= și rezultatul URL Encoded Text.\n6) Add Action → Open URLs.\n7) Apasă numele comenzii → Add to Home Screen, sau cheam-o cu Siri.',apTest:'Trimite o plată de test'});Object.assign(T.en,{apAT0:'x',apAT:'Option 1 · Automatic with Apple Pay (iOS 17 or later)',apA0:'0) iPhone Settings → Apps → Wallet → turn on Mobile Data.\n1) iOS 17–26: Shortcuts → Automation → + → Transaction (iOS 26: Wallet) → pick your cards → Run Immediately → New Blank Automation.\n    iOS 27: create a new shortcut, then Edit → Automation → Transaction, under “When I tap” choose Any Card. Then ⓘ → Privacy → turn on Allow Running When Locked.\n2) First action: URL Encode. For its input choose Shortcut Input and tap it to pick the Merchant property.\n3) Second action: URL. Type the link above (it ends with ?amt=), add Shortcut Input → Amount property, type &m= and add the URL Encoded Text result from step 2 (Select Variable → the blue token under the action).\n4) Third action: Open URLs.\n5) Make a test payment.\nCareful: do not encode the whole link, only the merchant, or ? & = / get broken.',apBT:'Option 2 · Manual, any iOS',apB:'1) Shortcuts → Shortcuts tab → + (new shortcut).\n2) Add Action → Ask for Input: type Number, question “How much did you pay?”.\n3) Another Ask for Input: type Text, question “Where did you pay?”.\n4) Add Action → URL Encode, with the answer of the second question (the place).\n5) Add Action → URL: the link above (ends with ?amt=), the variable of the first question (amount), type &m= and the URL Encoded Text result.\n6) Add Action → Open URLs.\n7) Tap the shortcut name → Add to Home Screen, or call it with Siri.',apTest:'Send a test payment'});
Object.assign(T.ro,{gTitle:'Obiective de economisire',gNone:'Niciun obiectiv. Alege suma și în câte luni vrei s-o strângi, iar eu calculez cât să aloci lunar.',gAdd:'Obiectiv nou',gNew:'Obiectiv nou',gEdit:'Editează obiectivul',gName:'Nume (de ex. Vacanță)',gTarget:'Suma țintă',gSaved:'Deja economisit (opțional)',gMonths:'În câte luni vrei să ajungi la obiectiv',gDeposit:'Depune',gPlan:'Alocă lunar',gMonthsLeft:'{n} luni rămase',gDeadline:'termen',gDone:'Obiectiv atins 🎉',gThisMonth:'Depus luna asta',gPrev:'Trebuie să aloci {a} pe lună, timp de {n} luni, până în {d}.',gPrevDone:'Ai deja suma țintă.',gBad:'Verifică numele, suma țintă și numărul de luni (1–600).',gDel:'Șterge obiectivul',gDepTitle:'Depune în {g}',gDepHint:'Suma se scade din sold ca o cheltuială în categoria Economii și se adaugă la obiectiv.',gAlloc:'Alocat pentru economii',r532T:'Regula 50/20/30',r532Need:'Necesități (50%)',r532Sav:'Economii (20%)',r532Want:'Dorințe (30%)',r532NoInc:'Adaugă venitul lunii ca să calculez regula 50/20/30.',tipT:'Sfatul lunii',tipRule:'Cu venitul de {i}, regula 50/20/30 înseamnă: necesități {a}, economii {b}, dorințe {c}.',tipOpen:'Vezi în Buget',cGrp:'Tip cheltuială (pentru regula 50/20/30)',gNeed:'Necesitate',gWant:'Dorință'});Object.assign(T.en,{gTitle:'Savings goals',gNone:'No goals yet. Pick an amount and in how many months you want it, and I will calculate how much to set aside monthly.',gAdd:'New goal',gNew:'New goal',gEdit:'Edit goal',gName:'Name (e.g. Vacation)',gTarget:'Target amount',gSaved:'Already saved (optional)',gMonths:'In how many months do you want to reach it',gDeposit:'Deposit',gPlan:'Set aside monthly',gMonthsLeft:'{n} months left',gDeadline:'deadline',gDone:'Goal reached 🎉',gThisMonth:'Deposited this month',gPrev:'You need to set aside {a} per month, for {n} months, until {d}.',gPrevDone:'You already have the target amount.',gBad:'Check the name, target amount and number of months (1–600).',gDel:'Delete goal',gDepTitle:'Deposit into {g}',gDepHint:'The amount is deducted from your balance as an expense in the Savings category and added to the goal.',gAlloc:'Allocated to savings',r532T:'50/20/30 rule',r532Need:'Needs (50%)',r532Sav:'Savings (20%)',r532Want:'Wants (30%)',r532NoInc:'Add this month’s income so I can calculate the 50/20/30 rule.',tipT:'Tip of the month',tipRule:'With an income of {i}, the 50/20/30 rule means: needs {a}, savings {b}, wants {c}.',tipOpen:'See in Budget',cGrp:'Expense type (for the 50/20/30 rule)',gNeed:'Need',gWant:'Want'});
Object.assign(T.ro,{prvT:'Mod confidențial',prvHideH:'Înlocuiește sumele cu •••• pe tot ecranul. Îl poți porni și cu ochiul din colțul de sus.',privOn:'Sume ascunse',privOff:'Sume vizibile',prvStart:'Ascunde sumele la deschidere',prvPin:'PIN de deschidere',prvPinOn:'Activ (4 cifre). Se cere la deschidere și după ce lași aplicația în fundal mai mult de 30 de secunde.',prvPinOff:'Dezactivat.',prvSetPin:'Setează PIN',prvChPin:'Schimbă PIN-ul',prvRmPin:'Oprește PIN-ul',prvNote:'Blocare simplă: împiedică privirile în treacăt. Nu înlocuiește blocarea telefonului și nu criptează datele.',prvNoCrypto:'PIN-ul nu e disponibil în acest browser.',lkEnter:'Introdu PIN-ul',lkNew:'Alege un PIN de 4 cifre',lkRep:'Repetă PIN-ul',lkOld:'Introdu PIN-ul curent',lkBad:'PIN greșit',lkMis:'PIN-urile nu se potrivesc. Încearcă din nou.',lkWait:'Prea multe încercări. Așteaptă {s} secunde.',lkForgot:'Ai uitat PIN-ul?',lkSure:'Apasă din nou: șterge PIN-ul și datele salvate doar pe acest telefon',lkCancel:'Anulează',logT:'Ce e nou',logNew:'Ce e nou în versiunea {v}',logSee:'Vezi detalii'});Object.assign(T.en,{prvT:'Privacy mode',prvHideH:'Replaces amounts with •••• across the screen. You can also toggle it with the eye at the top.',privOn:'Amounts hidden',privOff:'Amounts visible',prvStart:'Hide amounts on launch',prvPin:'Launch PIN',prvPinOn:'On (4 digits). Asked at launch and after the app has been in the background for over 30 seconds.',prvPinOff:'Off.',prvSetPin:'Set PIN',prvChPin:'Change PIN',prvRmPin:'Turn off PIN',prvNote:'A simple lock: it stops casual glances. It does not replace your phone lock and does not encrypt data.',prvNoCrypto:'PIN is not available in this browser.',lkEnter:'Enter your PIN',lkNew:'Choose a 4-digit PIN',lkRep:'Repeat the PIN',lkOld:'Enter your current PIN',lkBad:'Wrong PIN',lkMis:'PINs do not match. Try again.',lkWait:'Too many attempts. Wait {s} seconds.',lkForgot:'Forgot your PIN?',lkSure:'Tap again: removes the PIN and data saved only on this phone',lkCancel:'Cancel',logT:'What’s new',logNew:'What’s new in version {v}',logSee:'See details'});
Object.assign(T.ro,{csvT:'Import din extras de cont (CSV)',csvIntro:'Alege fișierul CSV exportat din aplicația băncii sau lipește conținutul lui. Recunosc singur coloanele și comercianții; poți corecta înainte de import. Sumele în altă monedă se sar.',csvPick:'Alege fișier CSV',csvPaste:'sau lipește aici conținutul:',csvNext:'Continuă',csvCols:'Coloane',cDate:'Data',cDesc:'Descriere',cAmt:'Sumă (cu semn)',cDeb:'Debit (opțional)',cCre:'Credit (opțional)',cNone:'— nimic —',csvFmt:'Format dată',csvDmy:'zi / lună / an',csvMdy:'lună / zi / an',csvNeg:'Sumele negative sunt cheltuieli',csvDup:'Sari peste ce pare deja introdus (aceeași sumă, ±1 zi)',csvFlag:'Marchează cu ❓ ce nu recunosc',csvSum:'{n} tranzacții de importat: {e} cheltuieli, {i} venituri',csvSkip:'Sărite: {d} deja existente, {b} rânduri invalide, {o} în altă monedă, {s} respinse sau în așteptare',csvPrev:'Previzualizare',csvGo:'Importă',csvDone:'Importate: {n} tranzacții',csvEmpty:'Nu am găsit rânduri valide. Verifică coloanele și formatul datei.',csvRead:'Nu am putut citi fișierul.',jrnT:'Jurnal de activitate',jrnNone:'Încă nu există activitate.',lgYou:'Tu',lgAdd:'a adăugat',lgEdit:'a modificat',lgDel:'a șters',lgPaid:'a plătit',lgImp:'a importat {n} tranzacții din CSV',lgDep:'a depus în obiectivul {g}',lgExp:'cheltuiala',lgInc:'venitul',lgPlan:'plata de făcut',lgSub:'abonamentul'});Object.assign(T.en,{csvT:'Import from bank statement (CSV)',csvIntro:'Choose the CSV exported from your bank app or paste its contents. I detect columns and merchants automatically; you can correct before importing. Amounts in other currencies are skipped.',csvPick:'Choose CSV file',csvPaste:'or paste the contents here:',csvNext:'Continue',csvCols:'Columns',cDate:'Date',cDesc:'Description',cAmt:'Amount (signed)',cDeb:'Debit (optional)',cCre:'Credit (optional)',cNone:'— none —',csvFmt:'Date format',csvDmy:'day / month / year',csvMdy:'month / day / year',csvNeg:'Negative amounts are expenses',csvDup:'Skip what looks already entered (same amount, ±1 day)',csvFlag:'Mark unrecognised ones with ❓',csvSum:'{n} transactions to import: {e} expenses, {i} income',csvSkip:'Skipped: {d} already existing, {b} invalid rows, {o} other currency, {s} declined or pending',csvPrev:'Preview',csvGo:'Import',csvDone:'Imported: {n} transactions',csvEmpty:'No valid rows found. Check the columns and date format.',csvRead:'Could not read the file.',jrnT:'Activity log',jrnNone:'No activity yet.',lgYou:'You',lgAdd:'added',lgEdit:'edited',lgDel:'deleted',lgPaid:'paid',lgImp:'imported {n} transactions from CSV',lgDep:'deposited into goal {g}',lgExp:'expense',lgInc:'income',lgPlan:'upcoming payment',lgSub:'subscription'});
Object.assign(T.ro,{calT:'Reminder în calendar',calAdd:'Adaugă',calIntro:'Creează evenimente în Calendarul iPhone-ului pentru plățile viitoare și abonamente, cu notificare înainte de scadență.',calWhen:'Când să te anunț',calD0:'În ziua plății',calD1:'Cu 1 zi înainte',calD3:'Cu 3 zile înainte',calD7:'Cu o săptămână înainte',calHour:'Ora notificării',calWhat:'Ce adaug în calendar',calNone:'Nu ai plăți viitoare sau abonamente de adăugat.',calMonthly:'în fiecare lună, ziua {d}',calHow:'Se deschide meniul de partajare: alege Calendar (sau salvează fișierul și deschide-l), apoi „Adaugă tot”. Abonamentele se repetă lunar.',calNoAl:'Alege cel puțin o notificare.',calNoSel:'Alege cel puțin o plată.',calPay:'Plată',calSub:'Abonament',calDone:'Fișierul de calendar a fost creat.',calOpen:'Safari s-a deschis. Apasă „Adaugă la Calendar” ca să salvezi evenimentele.'});
Object.assign(T.en,{calT:'Calendar reminders',calAdd:'Add',calIntro:'Creates events in your iPhone Calendar for upcoming payments and subscriptions, with an alert before the due date.',calWhen:'When to alert me',calD0:'On the due day',calD1:'1 day before',calD3:'3 days before',calD7:'1 week before',calHour:'Alert time',calWhat:'What to add to the calendar',calNone:'No upcoming payments or subscriptions to add.',calMonthly:'every month, day {d}',calHow:'The share sheet opens: pick Calendar (or save the file and open it), then tap “Add All”. Subscriptions repeat monthly.',calNoAl:'Pick at least one alert.',calNoSel:'Pick at least one payment.',calPay:'Payment',calSub:'Subscription',calDone:'Calendar file created.',calOpen:'Safari opened. Tap “Add to Calendar” to save the events.'});
Object.assign(T.ro,{perT:'Vacanță și sezoane',perSel:'Perioadă specială',perNone:'— fără —',perPre:'Alege o temă',perFrom:'De la',perTo:'Până la',perBud:'Buget pentru perioadă (opțional)',perHow:'Cheltuielile din perioadă primesc automat eticheta ei și nu mai intră în bugetele lunare pe categorii. Perioada se închide singură la data de final.',perNew:'Perioadă nouă',perEdit:'Editează perioada',perAdd:'+ Adaugă vacanță sau sezon',perAct:'În desfășurare',perUp:'Urmează',perDone:'Încheiate',perNoneYet:'Nicio perioadă încă. Adaugă o vacanță sau o temă de sezon (Crăciun, Black Friday, începutul școlii), cu buget separat.',perOut:'Din perioade speciale (în afara bugetului)',perDay:'Ziua {d} din {n}',perStarts:'Începe peste {n} zile',perStartsT:'Începe mâine',perLeft:'Mai poți cheltui ~{a} pe zi',perOver:'Buget depășit cu {a}',perSpent:'Cheltuit',perEndNow:'Încheie acum',perDel:'Șterge perioada',perBad:'Completează numele și alege date valide (de la ≤ până la).',perNoBud:'fără buget',perEnded:'Încheiată',perVac:'Vacanță',perCust:'Altă temă',perXmas:'Crăciun',perNY:'Anul Nou',perBF:'Black Friday',perSch:'Începutul școlii'});
Object.assign(T.en,{perT:'Vacation & seasons',perSel:'Special period',perNone:'— none —',perPre:'Pick a theme',perFrom:'From',perTo:'To',perBud:'Budget for the period (optional)',perHow:'Expenses in the period get its tag automatically and stop counting toward the monthly category budgets. The period closes itself on the end date.',perNew:'New period',perEdit:'Edit period',perAdd:'+ Add vacation or season',perAct:'In progress',perUp:'Upcoming',perDone:'Ended',perNoneYet:'No periods yet. Add a vacation or a seasonal theme (Christmas, Black Friday, back to school) with its own budget.',perOut:'From special periods (outside the budget)',perDay:'Day {d} of {n}',perStarts:'Starts in {n} days',perStartsT:'Starts tomorrow',perLeft:'You can spend ~{a} per day',perOver:'Over budget by {a}',perSpent:'Spent',perEndNow:'End now',perDel:'Delete period',perBad:'Enter a name and valid dates (from ≤ to).',perNoBud:'no budget',perEnded:'Ended',perVac:'Vacation',perCust:'Other theme',perXmas:'Christmas',perNY:'New Year',perBF:'Black Friday',perSch:'Back to school'});
Object.assign(T.ro,{erT:'Raport erori',erIntro:'Dacă aplicația întâlnește o eroare, o salvează aici, iar când ești conectat o trimite în baza de date, ca să poată fi reparată.',erPriv:'Raportul conține doar: versiunea aplicației, mesajul și locul erorii, numele ultimelor butoane apăsate, numere de elemente și tipul telefonului. Nu conține sume, note sau nume.',erAuto:'Trimite automat rapoartele',erNone:'Nicio eroare înregistrată. Dacă apare ceva, o vei vedea aici.',erCopy:'Copiază raportul',erSend:'Trimite acum',erTest:'Generează o eroare de test',erClear:'Șterge istoricul',erSent:'trimis',erNot:'netrimis',erNoCloud:'Nu ești conectat la un cont, deci rapoartele rămân pe telefon. Le poți copia și trimite.',erCopied:'Copiat. Lipește-l în conversație.',erToastT:'A apărut o eroare',erToastS:'Raportul s-a salvat în Setări → Raport erori.',erSentN:'Trimit {n} rapoarte…',erNoneToSend:'Nimic de trimis.',erTestDone:'Eroare de test creată.',erCopyFail:'Nu am putut copia automat. Selectează textul de mai jos.'});
Object.assign(T.en,{erT:'Error report',erIntro:'If the app runs into an error, it saves it here and, when you are signed in, sends it to the database so it can be fixed.',erPriv:'A report contains only: the app version, the error message and place, the names of the last buttons pressed, item counts and the phone type. No amounts, notes or names.',erAuto:'Send reports automatically',erNone:'No errors recorded. If something happens you will see it here.',erCopy:'Copy report',erSend:'Send now',erTest:'Generate a test error',erClear:'Clear history',erSent:'sent',erNot:'not sent',erNoCloud:'You are not signed in, so reports stay on the phone. You can copy and send them.',erCopied:'Copied. Paste it into the conversation.',erToastT:'An error occurred',erToastS:'The report was saved in Settings → Error report.',erSentN:'Sending {n} reports…',erNoneToSend:'Nothing to send.',erTestDone:'Test error created.',erCopyFail:'Could not copy automatically. Select the text below.'});
Object.assign(T.ro,{lkAuto:'Auto',stGA:'Automatizări',stGD:'Date',stGP:'Confidențialitate și cont',stGS:'Activitate și suport',bsOk:'În buget',bsNear:'Aproape de limită',bsOver:'Buget depășit',perDoneN:'Perioade încheiate ({n}) ›'});
Object.assign(T.en,{lkAuto:'Auto',stGA:'Automation',stGD:'Data',stGP:'Privacy and account',stGS:'Activity and support',bsOk:'On budget',bsNear:'Near the limit',bsOver:'Over budget',perDoneN:'Ended periods ({n}) ›'});
Object.assign(T.ro,{apA:'0) Setări iPhone → Aplicații → Wallet → pornește Date mobile.\n1) Comenzi rapide → Automatizare → + → Tranzacție (Transaction). La „When I tap” alege Any Card, apoi Run Immediately. Pașii sunt aceiași pe iOS 26 și iOS 27.\n2) Prima acțiune: URL Encode, cu proprietatea Amount din Shortcut Input.\n3) A doua acțiune: URL Encode, cu proprietatea Merchant din Shortcut Input.\n4) A treia acțiune: Open URLs. Scrie linkul de sus (se termină cu ?amt=), pune după el rezultatul primului URL Encode (suma), scrie &m= și pune rezultatul celui de-al doilea (comerciantul). Când inserezi „URL Encoded Text”, Comenzi rapide te întreabă din care acțiune: după ?amt= alege cea cu Amount, iar după &m= cea cu Merchant.\n5) Opțional: Wait 5 seconds și Go to Home Screen, ca să te întorci singur la ecranul principal.\n6) ⓘ → Privacy → pornește Allow Running When Locked.\n7) Fă o plată de test.\nCodifică separat suma și comerciantul, nu tot linkul. Dacă totuși ajung inversate, aplicația le corectează singură.',apCfg:'Configurare Apple Pay și ghid',rchNewT:'Comerciant nou',rchNewP:'Vrei să țin minte „{c}” pentru „{m}”, ca plățile viitoare de la el să se completeze singure?',rchUpdT:'Actualizez regula?',rchUpdP:'Ai schimbat datele pentru „{m}”. Actualizez regula salvată sau modific doar plata aceasta?',rchSave:'Memorează pentru viitor',rchUpd:'Actualizează regula',rchOnce:'Doar această plată',rchBack:'Înapoi'});
Object.assign(T.en,{apA:'0) iPhone Settings → Apps → Wallet → turn on Mobile Data.\n1) Shortcuts → Automation → + → Transaction. Under “When I tap” choose Any Card, then Run Immediately. The steps are the same on iOS 26 and iOS 27.\n2) First action: URL Encode, using the Amount property of Shortcut Input.\n3) Second action: URL Encode, using the Merchant property of Shortcut Input.\n4) Third action: Open URLs. Type the link above (it ends with ?amt=), then the result of the first URL Encode (amount), type &m= and the result of the second (merchant). When you insert “URL Encoded Text”, Shortcuts asks which action it should come from: after ?amt= pick the one with Amount, after &m= the one with Merchant.\n5) Optional: Wait 5 seconds and Go to Home Screen, to return to the home screen on its own.\n6) ⓘ → Privacy → turn on Allow Running When Locked.\n7) Make a test payment.\nEncode the amount and the merchant separately, not the whole link. If they still end up swapped, the app corrects it.',apCfg:'Apple Pay setup and guide',rchNewT:'New merchant',rchNewP:'Should I remember “{c}” for “{m}”, so future payments from it fill in automatically?',rchUpdT:'Update the rule?',rchUpdP:'You changed the details for “{m}”. Update the saved rule or change only this payment?',rchSave:'Remember for the future',rchUpd:'Update the rule',rchOnce:'Only this payment',rchBack:'Back'});
Object.assign(T.ro,{swE:'Modifică',swD:'Șterge',unBtn:'Anulează',unAdd:'Tranzacție salvată',unEdit:'Modificare salvată',unDel:'Tranzacție ștearsă',unPaid:'Plată marcată',unRest:'Date importate',unChk:'Plata rămâne așa, fără verificare',apOk:'Lasă așa',apOkH:'Atinge plata ca s-o corectezi, sau ✕ ca s-o lași așa.',tdN:'{n} plăți azi',tdNone:'Nicio plată azi',tdLeft:'mai poți cheltui ~{a}',tdOver:'peste ritmul zilnic cu {a}',tdBoth:'Pentru amândoi: mai puteți cheltui ~{a} azi',tdEach:'~{a} fiecare',tdSplit:'tu ~{a} · {n} ~{b}',tdBothOver:'Împreună sunteți peste ritmul zilnic cu {a}',bkFile:'Salvează fișier backup',bkPick:'Alege fișier backup',bkSaved:'Fișierul de backup a fost creat. Salvează-l în Fișiere sau trimite-l unde vrei.',bkLoaded:'Fișier citit: {n} tranzacții. Apasă „Importă din text” și confirmă ca să înlocuiești datele.',bkTxtH:'Sau copiază și lipește textul:'});
Object.assign(T.en,{swE:'Edit',swD:'Delete',unBtn:'Undo',unAdd:'Transaction saved',unEdit:'Change saved',unDel:'Transaction deleted',unPaid:'Payment marked',unRest:'Data imported',unChk:'Payment kept as is, no review',apOk:'Keep as is',apOkH:'Tap a payment to fix it, or ✕ to keep it as is.',tdN:'{n} payments today',tdNone:'No payments today',tdLeft:'you can spend ~{a}',tdOver:'over the daily pace by {a}',tdBoth:'For both of you: you can spend ~{a} today',tdEach:'~{a} each',tdSplit:'you ~{a} · {n} ~{b}',tdBothOver:'Together you are over the daily pace by {a}',bkFile:'Save backup file',bkPick:'Choose backup file',bkSaved:'The backup file was created. Save it in Files or send it wherever you like.',bkLoaded:'File read: {n} transactions. Tap “Import from text” and confirm to replace your data.',bkTxtH:'Or copy and paste the text:'});
Object.assign(T.ro,{cusT:'Personalizare',cusFs:'Mărimea textului',cusDen:'Densitate',cusDc:'Compactă',cusDn:'Normală',cusDr:'Aerisită',cusCards:'Carduri pe prima pagină',cusCardsH:'Mută-le cu ▲ ▼ și ascunde ce nu folosești.',cusOn:'Vizibil',cusOff:'Ascuns',cusRst:'Ordinea implicită',cusCats:'Ordinea categoriilor',cusOrd:'Ordine',cusHold:'Ține apăsat pe o categorie și trage-o sus sau jos ca să schimbi ordinea.',cdToday:'Azi',cdAlert:'Alerte buget',cdChart:'Grafic și statistici',cCol:'Culoare',cColC:'Culoare personalizată'});
Object.assign(T.ro,{srPh:'Caută în tranzacții',srX:'Anulează',srNone:'Nimic găsit.',srN:'{n} rezultate'});Object.assign(T.en,{srPh:'Search transactions',srX:'Cancel',srNone:'No results.',srN:'{n} results'});
Object.assign(T.en,{cusT:'Customization',cusFs:'Text size',cusDen:'Density',cusDc:'Compact',cusDn:'Normal',cusDr:'Roomy',cusCards:'Home page cards',cusCardsH:'Move them with ▲ ▼ and hide what you do not use.',cusOn:'Shown',cusOff:'Hidden',cusRst:'Default order',cusCats:'Category order',cusOrd:'Order',cusHold:'Press and hold a category, then drag it up or down to change the order.',cdToday:'Today',cdAlert:'Budget alerts',cdChart:'Chart and statistics',cCol:'Color',cColC:'Custom color'});
Object.assign(T.ro,{apIntroA:'Pe Android, plățile se pot adăuga singure din notificările telefonului (Google Wallet sau aplicația băncii) sau din SMS-uri, cu o aplicație de automatizare gratuită. Aplicația citește suma și comerciantul din textul notificării. Dacă nu recunoaște comerciantul, plata apare cu ❓ și o corectezi o dată.',apNT:'Automat cu MacroDroid (Android)',apN:'Ghidul nu a fost încă încercat pe un telefon Android. Dacă ceva diferă, trimite-mi un exemplu de notificare și îl ajustez.\n\n1) Instalează aplicația Cheltuieli din Chrome: ⋮ → Instalează aplicația.\n2) Instalează MacroDroid din Google Play (varianta gratuită permite 5 macro-uri).\n3) În MacroDroid: Add Macro → Trigger → Notifications → Notification Received → alege aplicația care trimite notificarea de plată (Google Wallet sau aplicația băncii). Acordă accesul la notificări când ți se cere. Dacă banca îți trimite SMS la fiecare plată, poți folosi în schimb Trigger → Messaging → SMS Received.\n4) Action → Applications → Open Website/URL. Lipește linkul de mai sus (se termină cu ?n=) și adaugă imediat după el variabila cu textul notificării (Magic Text → Notification Text; la SMS: textul mesajului).\n5) Salvează macro-ul și fă o plată de test.\n\nNotificările de încasare (primit, rambursare) sunt ignorate. Sumele în altă monedă nu sunt convertite.',apNIgn:'Notificare ignorată: pare o încasare',apNBad:'Nu am găsit suma în notificare',apTag:'automat',apCfgA:'Configurare plăți automate și ghid'});
Object.assign(T.en,{apIntroA:'On Android, payments can be added automatically from phone notifications (Google Wallet or your bank app) or from SMS messages, using a free automation app. The app reads the amount and merchant from the notification text. If it does not recognise the merchant, the payment shows ❓ and you fix it once.',apNT:'Automatic with MacroDroid (Android)',apN:'This guide has not been tried on an Android phone yet. If something differs, send me an example notification and I will adjust it.\n\n1) Install the Expenses app from Chrome: ⋮ → Install app.\n2) Install MacroDroid from Google Play (the free version allows 5 macros).\n3) In MacroDroid: Add Macro → Trigger → Notifications → Notification Received → pick the app that sends the payment notification (Google Wallet or your bank app). Grant notification access when asked. If your bank sends an SMS for every payment, use Trigger → Messaging → SMS Received instead.\n4) Action → Applications → Open Website/URL. Paste the link above (it ends with ?n=) and add right after it the variable with the notification text (Magic Text → Notification Text; for SMS: the message text).\n5) Save the macro and make a test payment.\n\nIncoming-money notifications (received, refund) are ignored. Amounts in other currencies are not converted.',apNIgn:'Notification ignored: looks like incoming money',apNBad:'Could not find the amount in the notification',apTag:'auto',apCfgA:'Automatic payments setup and guide'});
const CN={'Mâncare':'Food','Subscripții':'Subscriptions','Combustibil':'Fuel','Facturi':'Bills','Casă':'Home','Sănătate':'Health','Distracție':'Fun','Cumpărături':'Shopping','Altele':'Other','Economii':'Savings','Salariu':'Salary'};
const CATS={exp:['Mâncare','Subscripții','Combustibil','Facturi','Casă','Sănătate','Distracție','Cumpărături','Altele'],inc:['Salariu','Bonus','Altele']};
let S={lang:'ro',cur:'RON',name:'',scope:'all',tipDone:'',seenVer:'',priv:false,privStart:false,theme:'teal',look:'auto'},tx=[],pl=[],pa='',edKind='tx',subs=[],cats=[],rules=[],goals=[],logs=[],per=[],plExp=false,ok=true,view=new Date(),tab='home',edId=null,type='exp',armed='';
view.setDate(1);
const $=s=>document.querySelector(s);
const t=k=>T[S.lang][k];
const loc=()=>S.lang==='en'?'en-US':'ro-RO';
const cn=c=>S.lang==='en'&&CN[c]||c;
const p2=n=>String(n).padStart(2,'0');
const mk=d=>d.getFullYear()+'-'+p2(d.getMonth()+1);
const today=()=>mk(new Date())+'-'+p2(new Date().getDate());
const fmtR=n=>{try{return n.toLocaleString(loc(),{style:'currency',currency:S.cur})}catch(e){return n.toFixed(2)+' '+S.cur}};
const maskS=x=>x.replace(/[-−]/g,'').replace(/\d[\d.,\s\u00a0\u202f]*\d|\d/,'••••');
const fmt=n=>S.priv?maskS(fmtR(n)):fmtR(n);
const fd=s=>new Date(s+'T00:00:00').toLocaleDateString(loc(),{day:'2-digit',month:'2-digit',year:'numeric'});
const mt=d=>{const s=d.toLocaleDateString(loc(),{month:'long',year:'numeric'});return s.charAt(0).toUpperCase()+s.slice(1)};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sum=(a,y)=>a.filter(x=>x.type===y).reduce((s,x)=>s+x.amt,0);
const err=m=>{$('#err').textContent=m};

function load(){
 try{localStorage.setItem('_t','1');localStorage.removeItem('_t');
  const r=localStorage.getItem(KEY);
  if(r){const o=JSON.parse(r);U=+o.u||((o.tx&&o.tx.length)||(o.planned&&o.planned.length)||(o.subs&&o.subs.length)?1:0);if(Array.isArray(o.tx))tx=o.tx;if(Array.isArray(o.planned))pl=o.planned;if(Array.isArray(o.subs))subs=o.subs;if(Array.isArray(o.cats))cats=o.cats;if(Array.isArray(o.rules))rules=o.rules;if(Array.isArray(o.goals))goals=o.goals;if(Array.isArray(o.logs))logs=o.logs;if(Array.isArray(o.periods))per=o.periods}
  const q=JSON.parse(localStorage.getItem(KEY2)||'{}');
  if(T[q.lang])S.lang=q.lang;
  if(['RON','EUR','USD','GBP','MDL'].includes(q.cur))S.cur=q.cur;
  if(typeof q.name==='string')S.name=q.name.slice(0,24);
  if(['all','me','partner','shared'].includes(q.scope))S.scope=q.scope;
  if(typeof q.tipDone==='string')S.tipDone=q.tipDone.slice(0,7);
  if(typeof q.seenVer==='string')S.seenVer=q.seenVer.slice(0,10);
  if(q.cal&&typeof q.cal==='object'){const c=q.cal;S.cal={d0:c.d0!==0&&c.d0!==false,d1:c.d1!==0&&c.d1!==false,d3:c.d3===1||c.d3===true,d7:c.d7===1||c.d7===true,h:Math.min(22,Math.max(6,+c.h||9))}}
  if(q.errAuto===false)S.errAuto=false;
  if(['s','m','l','x'].includes(q.fs))S.fs=q.fs;if(['c','n','r'].includes(q.den))S.den=q.den;
  if(Array.isArray(q.cards))S.cards=q.cards.filter(k=>CARDK.includes(k));if(Array.isArray(q.hide))S.hide=q.hide.filter(k=>CARDK.includes(k));
  if(THEMES[q.theme])S.theme=q.theme;if(['auto','light','dark'].includes(q.look))S.look=q.look;
  if(q.priv===true)S.priv=true;if(q.privStart===true){S.privStart=true;S.priv=true}
 }catch(e){ok=false}
 if(!cats.length)cats=defCats();
}
let U=0,DB=null,pushT=0;
function wr(){try{localStorage.setItem(KEY,JSON.stringify({tx,planned:pl,subs,cats,rules,goals,logs,periods:per,u:U}))}catch(e){ok=false;ERR.report('storage',e&&e.message||e,e&&e.stack,'wr')}}
function push(){
 if(!DB)return;clearTimeout(pushT);
 pushT=setTimeout(()=>{try{DB.set({tx,planned:pl,subs,set:{lang:S.lang,cur:S.cur,name:S.name},u:U}).catch(e=>console.error('db',e))}catch(e){console.error('db',e)}},500);
}
function save(){U=Date.now();wr();push();cloudPush()}
function saveSet(){U=Date.now();try{localStorage.setItem(KEY2,JSON.stringify(S))}catch(e){}wr();push()}

function applyStatic(){
 document.documentElement.lang=S.lang;applyTheme();
 document.querySelectorAll('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));
 $('.fab').setAttribute('aria-label',t('add'));$('#l-amt').textContent=t('amt')+' ('+S.cur+')';
 $('#f-amt').placeholder=S.lang==='en'?'0.00':'0,00';
 $('#imp').textContent=t('imp');$('#imp').classList.remove('dng');
 $('#del').textContent=t('del');$('#del').classList.remove('dng');
 $('#s-name').value=S.name;$('#s-name').placeholder=t('nmp');$('#s-lang').value=S.lang;$('#s-cur').value=S.cur;armed='';dl();
}

let hq='',hOpen=false;
function render(){
 const m=tx.filter(x=>x.date.startsWith(mk(view))&&vis(x));
 const inc=sum(m,'inc'),exp=sum(m,'exp'),bal=inc-exp,hr=new Date().getHours();
 let h=(ok||DB)?'':`<div class="warn">${t('nostore')}</div>`;
 if(C.syncErr)h+=`<div class="warn">${t('syncErr')}</div>`;
 if(apQ().length&&!apReady())h+=`<div class="warn">${t('apWait')}</div>`;
 h+=`<div class="hd"><div><small>${t('app')}</small><h2>${t(hr<12?'gm':hr<18?'ga':'ge')}${S.name?', '+esc(S.name):''} 👋</h2></div><div class="hbt"><button class="gear" data-act="priv" aria-label="${t(S.priv?'privOn':'privOff')}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>${S.priv?'<path d="M3 3l18 18"/>':''}</svg></button><button class="gear" data-act="set" aria-label="${t('set')}">⚙️</button></div></div>`;
 h+=scopeBar();
 const an=mAnim?(mAnim>0?' mir':' mil'):'';
 h+=`<div id="top" class="top${an}"><div class="nav"><button data-act="prev" aria-label="${t('prev')}">‹</button><h1>${mt(view)}</h1><button data-act="next" aria-label="${t('next')}">›</button></div>`;
 h+=`<div class="sum"><span>${t('bal')}</span><div class="big" data-cuk="bal" data-cu="${bal}">${fmt(bal)}</div>${budChip()}<div class="two"><div><span>↑ ${t('inc')}</span><b data-cuk="inc" data-cu="${inc}">${fmt(inc)}</b></div><div><span>↓ ${t('exp')}</span><b data-cuk="exp" data-cu="${exp}">${fmt(exp)}</b></div></div></div></div>`;
 h+=`<div class="pager${an}${mAnim?' noanim':''}" id="pgr"><div class="track" id="trk"><section class="pane" id="p-home">${whatsNewCard()+homeCards(m,inc,exp)}</section><section class="pane" id="p-hist">${searchBar()}<div id="hs-res">${histBody(m)}</div></section><section class="pane" id="p-bud">${budgetPane()}</section></div></div>`;
 $('#app').innerHTML=h;
 document.querySelectorAll('.dock button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
 place(false);animNums();barsIn();
}
let offT=0,mAnim=0,busy=false,paT=0;
const TABS=['home','hist','bud'],TI=()=>TABS.indexOf(tab);
function ind(p,anim){const e=$('.ind');if(!e)return;e.style.transition=anim?'transform .38s cubic-bezier(.22,.8,.3,1)':'none';e.style.transform=`translateX(calc(${p*100}% + ${p*4}px))`}
function goMonth(d){view.setMonth(view.getMonth()+d);mAnim=d;render();mAnim=0}
function offAll(on){TABS.forEach(k=>{const e=$('#p-'+k);if(e)e.classList.toggle('off',on&&tab!==k)})}
function setOff(){offAll(true)}
function place(anim){
 const tr=$('#trk');if(!tr)return;
 tr.style.transition=anim?'transform .38s cubic-bezier(.22,.8,.3,1)':'none';
 tr.style.transform=`translateX(${-TI()*100/3}%)`;
 ind(TI(),anim);fabUpdate();
 clearTimeout(offT);
 if(anim){offAll(false);offT=setTimeout(setOff,430)}else setOff();
}
function switchTab(k){
 const ch=k!==tab;
 if(ch){tab=k;window.scrollTo(0,0)}
 document.querySelectorAll('.dock button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));
 place(true);
 if(ch)barsIn($('#p-'+tab));
}
let sx=0,sy=0,dx=0,lk='',zn='',rw=null,swBlock=0;const SWW=90;
document.addEventListener('touchstart',e=>{
 rw=e.target.closest('.swr');
 zn=rw?'p':e.target.closest('#top')?'t':'';
 document.querySelectorAll('.swr.open').forEach(w=>{if(w!==rw)w.classList.remove('open')});
 if(!zn||e.touches.length!==1||busy){lk='x';return}
 sx=e.touches[0].clientX;sy=e.touches[0].clientY;dx=0;lk='';
},{passive:true});
document.addEventListener('touchmove',e=>{
 if(lk==='x'||lk==='v')return;
 const x=e.touches[0].clientX-sx,y=e.touches[0].clientY-sy;
 if(!lk){
  if(Math.abs(x)<8&&Math.abs(y)<8)return;
  lk=Math.abs(x)>Math.abs(y)?'h':'v';
  if(lk==='h'&&rw){lk='r';rw.classList.add('drag')}
  if(lk==='h'){
   if(zn==='p'){offAll(false);$('#trk').style.transition='none'}
   else $('#top').style.transition='none';
  }
 }
 if(lk==='r'){
  const base=rw.classList.contains('open')?(rw.dataset.dir==='r'?SWW:-SWW):0,v=Math.max(-SWW-30,Math.min(SWW+30,base+x));
  rw.dataset.dir=v>0?'r':'l';rw.querySelector('.row').style.transform=`translateX(${v}px)`;swBlock=Date.now()+400;return
 }
 if(lk!=='h')return;
 if(zn==='p'){
  const i=TI(),w=$('#pgr').offsetWidth;
  dx=((i===0&&x>0)||(i===TABS.length-1&&x<0))?x*.3:x;
  $('#trk').style.transform=`translateX(calc(${-i*100/3}% + ${dx}px))`;
  ind(Math.min(TABS.length-1,Math.max(0,i-dx/w)),false);
 }else{dx=x;$('#top').style.transform=`translateX(${dx}px)`}
},{passive:true});
function endTouch(){
 if(lk==='r'&&rw){
  const r=rw.querySelector('.row'),m=(r.style.transform||'').match(/-?[\d.]+/),v=m?+m[0]:0;
  rw.classList.remove('drag');r.style.transform='';rw.dataset.dir=v>0?'r':'l';rw.classList.toggle('open',Math.abs(v)>SWW/2);
  swBlock=Date.now()+400;lk='';rw=null;dx=0;return;
 }
 if(lk==='h'){const w=window.innerWidth;
  if(zn==='p'){
   if(dx<-w*.18&&TI()<TABS.length-1)switchTab(TABS[TI()+1]);
   else if(dx>w*.18&&TI()>0)switchTab(TABS[TI()-1]);
   else place(true);
  }else if(Math.abs(dx)>w*.2)goMonth(dx<0?1:-1);
  else{const el=$('#top');el.style.transition='transform .25s ease-out';el.style.transform='translateX(0)'}
 }
 lk='';dx=0;
}
document.addEventListener('keydown',e=>{
 if(e.key!=='Enter'||e.isComposing)return;
 const id=e.target.id;
 if(id==='f-amt'||id==='f-note'){e.preventDefault();saveTx()}
 else if(id==='c-name'||id==='c-amt'||id==='c-emo'){e.preventDefault();saveCat()}
 else if(id==='s-name'){e.preventDefault();setDone()}
 else if(id==='g-name'||id==='g-target'||id==='g-saved'||id==='g-months'||id==='g-emo'){e.preventDefault();saveGoal()}
 else if(id==='d-amt'){e.preventDefault();saveDep()}
 else if(id==='a-pass'){e.preventDefault();accDo('signin')}
 else if(id==='a-code'){e.preventDefault();accDo('joinhome')}
});
document.addEventListener('touchend',endTouch);
document.addEventListener('touchcancel',endTouch);

const dim=ym=>new Date(+ym.slice(0,4),+ym.slice(5,7),0).getDate();
const dueOf=(sb,ym)=>ym+'-'+p2(Math.min(sb.day,dim(ym)));
const paidSub=(sb,ym)=>tx.some(r=>r.sid===sb.id&&r.sm===ym);
function monthPlan(ym){
 const a=pl.filter(x=>x.date.startsWith(ym)&&vis(x)).map(x=>({key:'p'+x.id,id:x.id,kind:'plan',amt:x.amt,cat:x.cat,date:x.date,note:x.note}));
 const b=subs.filter(sb=>sb.from<=ym&&vis(sb)&&!paidSub(sb,ym)).map(sb=>({key:'s'+sb.id,id:sb.id,kind:'sub',amt:sb.amt,cat:sb.cat,date:dueOf(sb,ym),note:sb.note}));
 return [...a,...b].sort((x,y)=>x.date.localeCompare(y.date));
}
function planCard(){
 const q=monthPlan(mk(view)),td=today(),n=q.length;
 const row=x=>{const late=x.date<td;return `<div class="pr"><button class="row" data-act="edit" data-kind="${x.kind}" data-id="${x.id}">${ic(x)}<span class="rt"><b>${esc(cn(x.cat))}</b><small class="${late?'late':''}">${x.kind==='sub'?'🔁\u00a0':''}${fd(x.date)}${late?' · '+t('late'):''}${x.note?' · '+esc(x.note):''}</small></span><em class="r">${fmt(x.amt)}</em></button><button class="pay${pa===x.key?' pri':''}" data-act="pay" data-key="${x.key}" aria-label="${t('paid')}">${pa===x.key?t('paid'):'✓'}</button></div>`};
 let h=`<div class="plan plc${plExp&&n>1?' open':''}"><h3><span>🗓️ ${t('pl')}</span><span>${n?fmt(q.reduce((a,x)=>a+x.amt,0)):''}</span></h3>`;
 if(!n)return h+`<p class="hint">${t('plnone')}</p></div>`;
 h+=row(q[0]);
 if(n>1)h+=`<div class="plm"><div class="pli">${q.slice(1).map(row).join('')}</div></div><button class="plt" data-act="togglePlan" aria-expanded="${plExp}"><span class="pll">${plExp?t('less'):t('all')+' ('+n+')'}</span><i class="chev">▾</i></button>`;
 return h+'</div>';
}
function togglePlan(){
 plExp=!plExp;
 const c=document.querySelector('.plan.plc');if(!c)return;
 c.classList.toggle('open',plExp);
 const b=c.querySelector('.plt');
 if(b){b.setAttribute('aria-expanded',plExp);b.querySelector('.pll').textContent=plExp?t('less'):t('all')+' ('+c.querySelectorAll('.pr').length+')'}
}
function payPlan(key){
 if(pa!==key){pa=key;clearTimeout(paT);paT=setTimeout(()=>{pa='';render()},4000);render();return}
 pa='';clearTimeout(paT);snapU();
 const id=+key.slice(1),ym=mk(view),cur=ym<=mk(new Date());
 if(key[0]==='p'){
  const x=pl.find(r=>r.id===id);
  if(x){pl=pl.filter(r=>r.id!==id);tx.push({id:x.id,type:'exp',amt:x.amt,cat:x.cat,date:today(),note:x.note,...(x.own?{own:x.own}:{}),...(x.own==='shared'?{by:C.uid}:{})});logAdd('paid','plan',{c:x.cat,m:x.amt,n:x.note});save()}
 }else{
  const sb=subs.find(r=>r.id===id);
  if(sb&&!paidSub(sb,ym)){tx.push({id:Date.now(),type:'exp',amt:sb.amt,cat:sb.cat,date:ym<mk(new Date())?dueOf(sb,ym):today(),note:sb.note,sid:sb.id,sm:ym,...(sb.own?{own:sb.own}:{}),...(sb.own==='shared'?{by:C.uid}:{})});logAdd('paid','sub',{c:sb.cat,m:sb.amt,n:sb.note});save()}
 }
 render();undoShow('unPaid');
}

function dl(){$('#l-date').textContent=t(type==='plan'?'due':type==='sub'?'due1':'date')}

function dayLbl(d){
 const y=new Date();y.setDate(y.getDate()-1);
 if(d===today())return t('today');
 if(d===mk(y)+'-'+p2(y.getDate()))return t('yday');
 const w=new Date(d+'T00:00:00').toLocaleDateString(loc(),{weekday:'long'});
 return w.charAt(0).toUpperCase()+w.slice(1)+' · '+fd(d);
}
function list(m,q){
 if(!m.length)return `<p class="empty"><span class="pig">${q?'🔍':'🐷'}</span>${t(q?'srNone':'none')}</p>`;
 const s=[...m].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 let h='',d='';
 for(const x of s){
  if(x.date!==d){d=x.date;h+=`<div class="day">${dayLbl(d)}</div>`}
  h+=`<div class="swr"><div class="swa l"><button class="e" data-act="swedit" data-id="${x.id}">✏️ ${t('swE')}</button></div><div class="swa r"><button class="d" data-act="swdel" data-id="${x.id}">🗑 ${t('swD')}</button></div><button class="row" data-act="edit" data-id="${x.id}">${ic(x)}<span class="rt"><b>${esc(cn(x.cat))}${x.sid?' 🔁':''}${x.chk?' ❓':''}${x.pk?' '+esc(perEm(x.pk)):''}</b>${x.note?`<small>${esc(x.note)}</small>`:''}</span><em class="${x.type==='inc'?'g':'r'}">${x.type==='inc'?'+':'−'}${fmt(x.amt)}</em></button></div>`;
 }
 return h;
}

/* ===== Căutare în Istoric (tragi de sus în jos, ca pe iPhone) ===== */
const fold=x=>String(x==null?'':x).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function searchTx(q){
 const w=fold(q).split(/\s+/).filter(Boolean);if(!w.length)return [];
 return tx.filter(x=>{
  if(!vis(x))return false;
  const a=(+x.amt||0),h=fold([x.note,x.cat,cn(x.cat),a,String(a).replace('.',','),a.toFixed(2),a.toFixed(2).replace('.',','),x.date,fd(x.date)].join(' '));
  return w.every(k=>h.includes(k));
 }).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,300);
}
function histBody(m){
 if(hq.trim()){const r=searchTx(hq);return (r.length?`<p class="hint srn">${t('srN').replace('{n}',r.length)}</p>`:'')+list(r,1)}
 return list(m||tx.filter(x=>x.date.startsWith(mk(view))&&vis(x)));
}
function searchBar(){
 return `<div class="hs${hOpen?' open':''}" id="hs"><div class="hsi"><input id="hs-q" type="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${t('srPh')}" aria-label="${t('srPh')}" value="${esc(hq)}"><button id="hs-x" type="button">${t('srX')}</button></div></div>`;
}
function hsUpdate(){const r=$('#hs-res');if(r)r.innerHTML=histBody()}
function hsOpen(){
 hOpen=true;const b=$('#hs'),i=$('#hs-q');if(b){b.classList.remove('pull');b.style.height='';b.classList.add('open')}
 if(i)i.focus();
}
function hsClose(){
 hq='';hOpen=false;const b=$('#hs'),i=$('#hs-q');if(i){i.value='';i.blur()}
 if(b){b.classList.remove('pull');b.style.height='';b.classList.remove('open')}
 hsUpdate();
}
(function(){
 let y0=0,x0=0,on=0,pull=0;
 const bar=()=>$('#hs');
 document.addEventListener('touchstart',e=>{
  on=0;pull=0;
  if(tab!=='hist'||hOpen||e.touches.length!==1||window.scrollY>0||!e.target.closest('#app'))return;
  y0=e.touches[0].clientY;x0=e.touches[0].clientX;on=1;
 },{passive:true});
 document.addEventListener('touchmove',e=>{
  if(!on)return;
  const b=bar(),dy=e.touches[0].clientY-y0,dx=e.touches[0].clientX-x0;
  if(!b||window.scrollY>0){on=0;if(pull){b&&(b.classList.remove('pull'),b.style.height='');pull=0}return}
  if(!pull){
   if(Math.abs(dy)<8&&Math.abs(dx)<8)return;
   if(dy>0&&Math.abs(dy)>Math.abs(dx))pull=1;else{on=0;return}
  }
  b.classList.add('pull');b.style.height=Math.min(52,Math.max(0,(dy-8)*.6))+'px';
  if(e.cancelable)e.preventDefault();
 },{passive:false});
 const end=()=>{
  if(on&&pull){const b=bar(),h=b?parseFloat(b.style.height)||0:0;if(b){b.classList.remove('pull');b.style.height=''}if(h>=34){swBlock=Date.now()+400;hsOpen()}}
  on=0;pull=0;
 };
 document.addEventListener('touchend',end);
 document.addEventListener('touchcancel',end);
 document.addEventListener('input',e=>{if(e.target.id==='hs-q'){hq=e.target.value;hsUpdate()}});
 document.addEventListener('click',e=>{if(e.target.closest('#hs-x'))hsClose()});
 document.addEventListener('keydown',e=>{if(e.target.id==='hs-q'&&e.key==='Enter'&&!e.isComposing){e.preventDefault();e.target.blur()}});
})();

const EM={'Mâncare':'🍽️','Subscripții':'🔄','Combustibil':'⛽','Facturi':'🧾','Casă':'🏠','Sănătate':'💊','Distracție':'🎮','Cumpărături':'🛍️','Altele':'✨','Economii':'🏦','Salariu':'💼','Bonus':'🎁'};
const catEm=c=>{const k=cats.find(k=>k.name===c);return (k&&k.emoji)||EM[c]||'✨'};
const ic=x=>{const c=x.type==='inc'?'#16a34a':cc(x.cat);return `<i class="ic" style="background:${c}2e">${esc(catEm(x.cat))}</i>`};
const COL=['#0f766e','#0284c7','#ea580c','#d97706','#7c3aed','#db2777','#65a30d','#dc2626','#64748b'];
const cc=c=>{const i=cats.findIndex(k=>k.name===c);if(i>=0&&/^#[0-9a-f]{6}$/i.test(cats[i].col||''))return cats[i].col;return COL[i<0?COL.length-1:i%(COL.length-1)]};
const pc=n=>n.toLocaleString(loc(),{maximumFractionDigits:1})+'%';

function charts(m,inc,exp){
 const by={};
 m.filter(x=>x.type==='exp').forEach(x=>by[x.cat]=(by[x.cat]||0)+x.amt);
 const e=Object.entries(by).sort((a,b)=>b[1]-a[1]);
 if(!e.length)return `<p class="empty"><span class="pig">📊</span>${t('noexp')}</p>`;
 const base=inc>0?Math.max(inc,exp):exp,den=inc>0?inc:exp,R=44,C=2*Math.PI*R;
 let off=0,svg=`<svg class="donut" viewBox="0 0 120 120" role="img" aria-label="${t('spent')}"><circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--bd)" stroke-width="18"/>`;
 e.forEach(([c,v])=>{const l=v/base*C;svg+=`<circle cx="60" cy="60" r="${R}" fill="none" stroke="${cc(c)}" stroke-width="18" stroke-dasharray="${l} ${C-l}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`;off+=l});
 
 let cPct = 100, cTxt = t('ofexp');
 if(inc>0){
  if(inc>=exp){ cPct = Math.round((inc-exp)/inc*100); cTxt = t('avail'); }
  else{ cPct = Math.round(exp/inc*100); cTxt = t('spent'); }
 }
 svg+=`<text x="60" y="60" text-anchor="middle" font-size="20" font-weight="700" fill="currentColor">${cPct}%</text><text x="60" y="76" text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">${cTxt}</text></svg>`;
 
 let h=`<div class="card">${svg}`;
 if(inc>0)h+=exp>inc?`<p class="note over">${t('over')} ${fmt(exp-inc)}</p>`:`<p class="note">${t('left')}: <b>${fmt(inc-exp)}</b> (${pc((inc-exp)/inc*100)})</p>`;
 else h+=`<p class="note">${t('noinc')}</p>`;
 h+=`<p class="note">${t('top')}: <b>${esc(cn(e[0][0]))}</b> (${pc(e[0][1]/den*100)})</p>`;
 e.forEach(([c,v])=>{const p=v/den*100;h+=`<div class="bar"><div class="bl"><span class="lg"><i class="dot" style="background:${cc(c)}"></i>${esc(catEm(c))} ${esc(cn(c))}</span><span>${fmt(v)} · ${pc(p)}</span></div><div class="tr"><i style="width:${Math.min(p,100)}%;background:${cc(c)}"></i></div></div>`});
 const pv=new Date(view);pv.setMonth(pv.getMonth()-1);
 const pt=sum(tx.filter(x=>x.date.startsWith(mk(pv))&&vis(x)),'exp');
 h+=`<p class="note">${t('last')}: ${pt?`${fmt(pt)} (${exp>=pt?'+':'−'}${fmt(Math.abs(exp-pt))})`:t('nolast')}</p>`;
 return h+'</div>';
}

function setPick(){
 document.querySelectorAll('#look-seg button').forEach(x=>x.classList.toggle('on',x.dataset.v===(S.look||'auto')));
 const d=$('#thm-dots');
 if(d)d.innerHTML=Object.keys(THEMES).map(k=>`<button data-act="thm" data-v="${k}" class="${(S.theme||'teal')===k?'on':''}" style="background:linear-gradient(135deg,${THEMES[k].h1},${THEMES[k].h2})" aria-label="${k}"></button>`).join('');
}
function openSet(){applyStatic();{const e=$('#apm-ic');if(e)e.textContent=isAnd()?'🤖':'🍎'}setPick();$('#log-v').textContent='v'+APP_VER;{const n=ERR.list().filter(x=>!x.sent).length,b=$('#er-b');if(b)b.textContent=n?String(n)+' ':''}$('#st').hidden=false}
function openBk(){$('#bk').value=JSON.stringify({tx,planned:pl,subs,cats,rules,goals,periods:per},null,1);$('#msg').textContent='';$('#imp').textContent=t('imp');$('#imp').classList.remove('dng');armed='';$('#bkp').hidden=false}
function closeBk(){$('#bkp').hidden=true;armed=''}
function closeSet(){$('#st').hidden=true;armed=''}

function copy(){
 const a=$('#bk'),m=$('#msg');a.select();
 (navigator.clipboard?navigator.clipboard.writeText(a.value):Promise.reject())
  .then(()=>m.textContent=t('copied'))
  .catch(()=>{try{document.execCommand('copy');m.textContent=t('copied')}catch(e){m.textContent=t('manual')}});
}

function imp(){
 const b=$('#imp');
 if(armed!=='imp'){armed='imp';b.textContent=t('impsure');b.classList.add('dng');return}
 try{
  const o=JSON.parse($('#bk').value),a=Array.isArray(o)?o:o.tx;
  if(!Array.isArray(a))throw 0;
  snapU();
  tx=a.filter(x=>x&&(x.type==='exp'||x.type==='inc')&&Number.isFinite(+x.amt)&&+x.amt>0&&/^\d{4}-\d{2}-\d{2}$/.test(x.date))
   .map((x,i)=>({id:+x.id||Date.now()+i,type:x.type,amt:+x.amt,cat:String(x.cat||'Altele').slice(0,40),date:x.date,note:String(x.note||'').slice(0,80),...(x.sid?{sid:+x.sid,sm:String(x.sm||'')}:{}),...(x.ap?{ap:String(x.ap).slice(0,80)}:{}),...(x.chk?{chk:1}:{}),...(+x.sv?{sv:+x.sv}:{}),...(+x.pk?{pk:+x.pk}:{}),...(x.ik?{ik:String(x.ik).slice(0,90)}:{})}));
  pl=Array.isArray(o.planned)?o.planned.filter(x=>x&&Number.isFinite(+x.amt)&&+x.amt>0&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)).map((x,i)=>({id:+x.id||Date.now()+i,amt:+x.amt,cat:String(x.cat||'Altele').slice(0,40),date:x.date,note:String(x.note||'').slice(0,80)})):[];
  subs=Array.isArray(o.subs)?o.subs.filter(x=>x&&Number.isFinite(+x.amt)&&+x.amt>0&&/^\d{4}-\d{2}$/.test(x.from)&&+x.day>=1&&+x.day<=31).map((x,i)=>({id:+x.id||Date.now()+i,amt:+x.amt,cat:String(x.cat||'Altele').slice(0,40),day:+x.day,from:x.from,note:String(x.note||'').slice(0,80)})):[];
  if(Array.isArray(o.cats)&&o.cats.length)cats=o.cats.filter(x=>x&&typeof x.name==='string'&&x.name.trim()).map((x,i)=>({id:+x.id||Date.now()+i,name:String(x.name).slice(0,24),emoji:String(x.emoji||'✨').slice(0,4),b:(x.b&&typeof x.b==='object')?x.b:{},ord:+x.ord||i,...(x.grp==='n'||x.grp==='w'?{grp:x.grp}:{}),...(/^#[0-9a-f]{6}$/i.test(x.col||'')?{col:x.col}:{})}));
  if(Array.isArray(o.rules))rules=o.rules.filter(x=>x&&typeof x.key==='string'&&x.key&&typeof x.cat==='string').map((x,i)=>({id:+x.id||Date.now()+i,key:x.key.slice(0,60),cat:x.cat.slice(0,24),note:String(x.note||'').slice(0,80),own:x.own==='shared'?'shared':''}));
  goals=Array.isArray(o.goals)?o.goals.filter(x=>x&&typeof x.name==='string'&&Number.isFinite(+x.target)&&+x.target>0&&+x.months>=1&&/^\d{4}-\d{2}$/.test(x.start)).map((x,i)=>({id:+x.id||Date.now()+i,name:String(x.name).slice(0,30),emoji:String(x.emoji||'🎯').slice(0,4),target:+x.target,saved0:Math.max(0,+x.saved0||0),months:Math.round(+x.months),start:x.start})):[];
  per=Array.isArray(o.periods)?o.periods.filter(x=>x&&typeof x.name==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.start)&&/^\d{4}-\d{2}-\d{2}$/.test(x.end)&&x.start<=x.end).map((x,i)=>({id:+x.id||Date.now()+i,kind:x.kind==='vac'?'vac':'sez',name:String(x.name).slice(0,30),emoji:String(x.emoji||'✨').slice(0,4),start:x.start,end:x.end,budget:Math.max(0,+x.budget||0)})):[];
  save();render();armed='';
  b.textContent=t('imp');b.classList.remove('dng');
  $('#bk').value=JSON.stringify({tx,planned:pl,subs,cats,rules,goals,periods:per},null,1);
  $('#msg').textContent=t('impok').replace('{n}',tx.length);undoShow('unRest');
 }catch(e){armed='';b.textContent=t('imp');b.classList.remove('dng');$('#msg').textContent=t('impbad')}
}

function fillCats(sel){
 const l=type==='inc'?[...CATS.inc]:(cats.length?cats.map(c=>c.name):[...CATS.exp]);if(sel&&!l.includes(sel))l.push(sel);
 $('#f-cat').innerHTML=l.map(c=>`<option value="${esc(c)}"${c===sel?' selected':''}>${esc(catEm(c))} ${esc(cn(c))}</option>`).join('');
}
let sMode='exp';
function applySeg(){
 const sg=document.querySelector('#ov .seg');if(!sg)return;
 sg.hidden=sMode==='inc';
 sg.querySelectorAll('[data-type]').forEach(b=>{b.hidden=b.dataset.type==='inc'});
 const h=document.querySelector('#ov .mh h2');if(h)h.textContent=t(sMode==='inc'?'i1':'txt');
}
function setType(y,sel){
 type=y;
 if(y==='sub'&&!sel)sel='Subscripții';
 document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('on',b.dataset.type===y));
 fillCats(sel);dl();
 const h=$('#subh');if(h)h.hidden=y!=='sub';
 syncOwn();perSync();
}
function openSheet(id,kind,mode){
 edId=id;edKind=kind||'tx';armed='';
 const x=id?(edKind==='plan'?pl:edKind==='sub'?subs:tx).find(r=>r.id===id):null;
 sMode=mode||(x&&x.type==='inc'?'inc':'exp');
 ownSel=x&&x.own?(x.own==='shared'?'shared':x.own===C.uid?'me':'partner'):(C.hid&&C.mode==='common'?'shared':S.scope==='partner'?'partner':S.scope==='shared'?'shared':'me');
 setType(x?(edKind==='plan'?'plan':edKind==='sub'?'sub':x.type):(sMode==='inc'?'inc':'exp'),x&&x.cat);
 applySeg();
 if(C.hid)$('#f-by').value=x&&x.by?x.by:C.uid;
 $('#f-amt').value=x?String(x.amt).replace('.',S.lang==='en'?'.':','):'';
 $('#f-date').value=x?(edKind==='sub'?dueOf(x,x.from):x.date):today();
 $('#f-note').value=x?x.note:'';
 perSync(x&&x.type==='exp'?x.pk:null,!!x);
 err('');
 const d=$('#del');d.hidden=!x;d.textContent=t('del');d.classList.remove('dng');
 $('#ov').hidden=false;
 if(!x)setTimeout(()=>$('#f-amt').focus(),60);
}
function closeSheet(){$('#ov').hidden=true;edId=null;armed=''}

function saveTx(choice){
 try{
  if(choice!=='rule'&&choice!=='once')choice=undefined;
  const v=$('#f-amt').value.trim().replace(',','.'),d=$('#f-date').value||today();
  if(!/^\d+(\.\d{1,2})?$/.test(v)||!(parseFloat(v)>0))return err(t('eamt'));
  const o={amt:parseFloat(v),cat:$('#f-cat').value,date:d,note:$('#f-note').value.trim()};
  const own=C.hid?ownUid():null;
  if(own){o.own=own;if(type==='exp'&&own==='shared')o.by=$('#f-by').value||C.uid}
  const id=edId||Date.now(),old=edId?tx.find(r=>r.id===edId):null;
  if(!choice&&old&&old.ap&&type==='exp'){
   const changed=old.cat!==o.cat||(o.note||'')!==(old.note||'')||(own||'')!==(old.own||'');
   if(old.chk||changed){askRule(old,o);return}
  }
  const wasEdit=!!edId;snapU();
  if(edId){tx=tx.filter(r=>r.id!==edId);pl=pl.filter(r=>r.id!==edId);subs=subs.filter(r=>r.id!==edId)}
  if(type==='plan')pl.push({id,...o});
  else if(type==='sub')subs.push({id,amt:o.amt,cat:o.cat,note:o.note,day:+d.slice(8,10),from:d.slice(0,7),...(own?{own}:{})});
  else tx.push({id,type,...o,...(type==='exp'&&$('#perw')&&!$('#perw').hidden&&+$('#f-per').value?{pk:+$('#f-per').value}:{}),...(old&&old.sid&&type==='exp'?{sid:old.sid,sm:old.sm}:{}),...(old&&old.ap?{ap:old.ap}:{}),...(old&&old.sv?{sv:old.sv}:{})});
  if(old&&old.ap&&type==='exp'&&choice==='rule'){learnRule(old.ap,o.cat,o.note,own);applyRuleToPending(old.ap,o.cat,o.note,id)}
  logAdd(edId?'edit':'add',type==='inc'?'inc':type==='plan'?'plan':type==='sub'?'sub':'exp',{c:o.cat,m:o.amt,n:o.note});
  view=new Date(d+'T00:00:00');view.setDate(1);
  try{save()}catch(e){console.error(e)}
  closeSheet();render();undoShow(wasEdit?'unEdit':'unAdd');
 }catch(e){ERR.report('catch',e&&e.message||e,e&&e.stack,'saveTx');err('Eroare: '+(e&&e.message||e))}
}
let UN=null,unT=0;
function snapU(){UN=JSON.stringify({tx,pl,subs,cats,rules,goals,per})}
function undoShow(k){
 if(!UN)return;const el=$('#utoast');
 el.querySelector('span').textContent=t(k);el.querySelector('button').textContent=t('unBtn');
 el.hidden=false;clearTimeout(unT);unT=setTimeout(()=>{el.hidden=true;UN=null},7000);
}
function undoDo(){
 if(!UN)return;
 try{const o=JSON.parse(UN);tx=o.tx;pl=o.pl;subs=o.subs;cats=o.cats;rules=o.rules;goals=o.goals;per=o.per;}catch(e){}
 UN=null;clearTimeout(unT);$('#utoast').hidden=true;save();render();
}
function swDel(id){
 const it=tx.find(r=>r.id===id);if(!it)return;
 snapU();logAdd('del',it.type==='inc'?'inc':'exp',{c:it.cat,m:it.amt,n:it.note});
 tx=tx.filter(r=>r.id!==id);save();render();undoShow('unDel');
}
function todayCard(){
 try{
  const td=today(),ym=mk(new Date());
  if(mk(view)!==ym)return '';
  const day=tx.filter(x=>x.type==='exp'&&x.date===td&&vis(x)),sp=day.reduce((a,x)=>a+share(x,ym),0);
  const alloc=cats.reduce((a,c)=>a+bud(c,ym,wal()),0);
  let sub=day.length?t('tdN').replace('{n}',day.length):t('tdNone');
  if(alloc>0){
   const spM=cats.reduce((a,c)=>a+spentIn(c.name,ym),0),spBud=tx.filter(x=>x.type==='exp'&&x.date===td&&!x.pk).reduce((a,x)=>a+share(x,ym),0);
   const d=new Date(),left=dim(ym)-d.getDate()+1,allow=Math.max(0,alloc-(spM-spBud))/left,rest=allow-spBud;
   if(C.hid&&C.mode==='common'){
    const r=myRatio(ym);
    if(rest>=0){
     const each=Math.abs(r-.5)<.005?t('tdEach').replace('{a}',fmt(rest/2)):t('tdSplit').replace('{a}',fmt(rest*r)).replace('{n}',esc(pname())).replace('{b}',fmt(rest*(1-r)));
     sub+=`<br>👫 ${t('tdBoth').replace('{a}',fmt(rest))} · ${each}`;
    }else sub+=`<br>👫 ${t('tdBothOver').replace('{a}',fmt(-rest))}`;
   }else sub+=' · '+(rest>=0?t('tdLeft').replace('{a}',fmt(rest)):t('tdOver').replace('{a}',fmt(-rest)));
  }
  return `<div class="plan tdc"><i class="ic" style="background:var(--bg)">📅</i><div class="tn"><b>${t('today')}</b><small>${sub}</small></div><b class="r">${sp?'−'+fmt(sp):fmt(0)}</b></div>`;
 }catch(e){return ''}
}
async function bkFile(){
 const json=JSON.stringify({v:APP_VER,tx,planned:pl,subs,cats,rules,goals,periods:per},null,1),name='cheltuieli-backup-'+today()+'.json',m=$('#msg');
 try{
  const f=new File([json],name,{type:'application/json'});
  if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});m.textContent=t('bkSaved');return}
 }catch(e){if(e&&e.name==='AbortError')return}
 try{
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));a.download=name;
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);m.textContent=t('bkSaved');
 }catch(e){m.textContent=t('manual')}
}
document.addEventListener('change',e=>{
 if(e.target.id!=='bk-file')return;
 const f=e.target.files&&e.target.files[0];if(!f)return;
 const rd=new FileReader();
 rd.onload=()=>{
  try{
   const txt=String(rd.result||''),o=JSON.parse(txt),a=Array.isArray(o)?o:o.tx;if(!Array.isArray(a))throw 0;
   $('#bk').value=txt;armed='';const b=$('#imp');b.textContent=t('imp');b.classList.remove('dng');
   $('#msg').textContent=t('bkLoaded').replace('{n}',a.length);
  }catch(x){$('#msg').textContent=t('impbad')}
 };
 rd.onerror=()=>{$('#msg').textContent=t('csvRead')};
 rd.readAsText(f);e.target.value='';
});
function delTx(){
 const b=$('#del');
 if(armed!=='del'){armed='del';b.textContent=t('sure');b.classList.add('dng');return}
 {let kd='exp',it=tx.find(r=>r.id===edId);if(it)kd=it.type==='inc'?'inc':'exp';else if(it=pl.find(r=>r.id===edId))kd='plan';else if(it=subs.find(r=>r.id===edId))kd='sub';if(it)logAdd('del',kd,{c:it.cat,m:it.amt,n:it.note})}
 snapU();tx=tx.filter(r=>r.id!==edId);pl=pl.filter(r=>r.id!==edId);subs=subs.filter(r=>r.id!==edId);save();closeSheet();render();undoShow('unDel');
}

document.addEventListener('click',e=>{
 if(Date.now()<swBlock){e.preventDefault();return}
 const tb=e.target.closest('[data-tab]');
 if(tb){ERR.crumb('tab:'+tb.dataset.tab);switchTab(tb.dataset.tab);return}
 const ty=e.target.closest('[data-type]');
 if(ty){setType(ty.dataset.type);return}
 const ow=e.target.closest('[data-own]');
 if(ow){ownSel=ow.dataset.own;syncOwn();return}
 const gm=e.target.closest('[data-gemo]');
 if(gm){$('#g-emo').value=gm.dataset.gemo;return}
 const gp=e.target.closest('[data-grp]');
 if(gp){catGrp=gp.dataset.grp;syncGrp();return}
 const kk=e.target.closest('[data-k]');
 if(kk){lkKey(kk.dataset.k);return}
 const em=e.target.closest('[data-emo]');
 if(em){$('#c-emo').value=em.dataset.emo;return}
 const b=e.target.closest('[data-act]');if(b)ERR.crumb(b.dataset.act);
 if(!b){if(e.target.id==='rch')closeRch();if(e.target.id==='erp')closeErr();if(e.target.id==='per')closePer();if(e.target.id==='perE')closePe();if(e.target.id==='cal')closeCal();if(e.target.id==='csv')closeCsv();if(e.target.id==='jrn')closeJrn();if(e.target.id==='prv')closePrv();if(e.target.id==='log')closeLog();if(e.target.id==='goal')closeGoal();if(e.target.id==='dep')closeDep();if(e.target.id==='rul')closeRul();if(e.target.id==='cat')closeCat();if(e.target.id==='cus')closeCus();if(e.target.id==='acc')closeAcc();if(e.target.id==='ov')closeSheet();if(e.target.id==='st')closeSet();if(e.target.id==='bkp')closeBk();return}
 const a=b.dataset.act;
 if(a==='prev'||a==='next')goMonth(a==='next'?1:-1);
 else if(a==='add'){if(tab==='bud')toggleFabm();else openSheet(null)}
 else if(a==='closefabm')closeFabm();
 else if(a==='toast'){const id=+$('#toast').dataset.id;$('#toast').hidden=true;if(id)openSheet(id)}
 else if(a==='rulopen')openRul();
 else if(a==='closerul')closeRul();
 else if(a==='copylink'){copyLink()}
 else if(a==='aptest'){closeRul();closeSet();location.href=isAnd()?apLink()+encodeURIComponent('Plată de 12,50 RON la TEST MAGAZIN '+String(Date.now()).slice(-4)+' cu cardul •••• 1234'):apLink()+'12,50&m='+encodeURIComponent('TEST MAGAZIN '+String(Date.now()).slice(-4))}
 else if(a==='delrule')delRule(+b.dataset.id);
 else if(a==='ruedit'){const i=+b.dataset.id;ruEd=ruEd===i?null:i;armed='';renderRul()}
 else if(a==='rushare'){const r=rules.find(x=>x.id===ruEd);if(r){r.own=r.own==='shared'?'':'shared';save();renderRul()}}
 else if(a==='rusave'){const r=rules.find(x=>x.id===+b.dataset.id);if(r){r.cat=$('#ru-cat').value;r.note=$('#ru-note').value.trim().slice(0,80);save();ruEd=null;renderRul();render()}}
 else if(a==='rchrule'){closeRch();saveTx('rule')}
 else if(a==='rchonce'){closeRch();saveTx('once')}
 else if(a==='rchback')closeRch()
 else if(a==='gobud')switchTab('bud');
 else if(a==='edit'){const w=b.closest('.swr.open');if(w){w.classList.remove('open');return}openSheet(+b.dataset.id,b.dataset.kind)}
 else if(a==='swedit')openSheet(+b.dataset.id,'tx')
 else if(a==='swdel')swDel(+b.dataset.id)
 else if(a==='undo')undoDo()
 else if(a==='cusopen')openCus(b.dataset.v)
 else if(a==='closecus')closeCus()
 else if(a==='fs'){S.fs=b.dataset.v;saveSet();applyTheme();renderCus()}
 else if(a==='den'){S.den=b.dataset.v;saveSet();applyTheme();renderCus()}
 else if(a==='cardtog'){const k=b.dataset.ck,h=new Set(S.hide||[]);h.has(k)?h.delete(k):h.add(k);S.hide=[...h];saveSet();render();renderCus()}
 else if(a==='cardmv'){const o=cardOrd(),i=o.indexOf(b.dataset.ck),j=i+(+b.dataset.d);if(i>=0&&j>=0&&j<o.length){[o[i],o[j]]=[o[j],o[i]];S.cards=o;saveSet();render();renderCus()}}
 else if(a==='cardrst'){S.cards=[];S.hide=[];saveSet();render();renderCus()}
 else if(a==='ccol'){catCol=b.dataset.v||'';colRender()}
 else if(a==='apok'){const x=tx.find(r=>r.id===+b.dataset.id);if(x){snapU();delete x.chk;save();render();undoShow('unChk')}}
 else if(a==='bkfile')bkFile()
 else if(a==='bkpick')$('#bk-file').click()
 else if(a==='pay')payPlan(b.dataset.key);
 else if(a==='close')closeSheet();
 else if(a==='save')saveTx();
 else if(a==='del')delTx();
 else if(a==='set')openSet();
 else if(a==='closeset')closeSet();
 else if(a==='setdone')setDone();
 else if(a==='bkopen')openBk();
 else if(a==='closebk')closeBk();
 else if(a==='copy')copy();
 else if(a==='imp')imp();
 else if(a==='togglePlan')togglePlan();
 else if(a==='accopen')openAcc();
 else if(a==='closeacc')closeAcc();
 else if(a==='scope'){S.scope=b.dataset.v;try{localStorage.setItem(KEY2,JSON.stringify(S))}catch(x){}render()}
 else if(a==='copycode')copyCode();
 else if(a==='addinc'){closeFabm();openSheet(null,undefined,'inc')}
 else if(a==='addcat'){closeFabm();openCat(null)}
 else if(a==='csvopen'){closeSet();openCsv()}
 else if(a==='closecsv')closeCsv();
 else if(a==='csvparse'){const v=$('#csv-text').value;if(v.trim())csvLoad(v)}
 else if(a==='csvtog'){csvOpt[b.dataset.ct]=!csvOpt[b.dataset.ct];csvRender()}
 else if(a==='csvgo')csvImport();
 else if(a==='jrnopen'){closeSet();openJrn()}
 else if(a==='closejrn')closeJrn();
 else if(a==='priv'){S.priv=!S.priv;saveLocal();render();prvRender()}
 else if(a==='look'){S.look=b.dataset.v;saveSet();applyTheme();setPick()}
 else if(a==='thm'){S.theme=b.dataset.v;saveSet();applyTheme();setPick()}
 else if(a==='erropen'){closeSet();openErr()}
 else if(a==='closeerr')closeErr();
 else if(a==='errauto'){S.errAuto=S.errAuto===false;saveSet();errRender();if(S.errAuto!==false)ERR.flush(false)}
 else if(a==='errcopy')errCopy();
 else if(a==='errsend'){const n=ERR.flush(true);$('#err-msg').textContent=n?t('erSentN').replace('{n}',n):t('erNoneToSend');setTimeout(errRender,1500)}
 else if(a==='errtest'){ERR.test();errRender();$('#err-msg').textContent=t('erTestDone')}
 else if(a==='errclear'){ERR.clear();errRender();$('#err-msg').textContent=''}
 else if(a==='peropen'){closeSet();openPer()}
 else if(a==='closeper')closePer();
 else if(a==='peedit'){openPe(b.dataset.id?+b.dataset.id:null)}
 else if(a==='closepe')closePe();
 else if(a==='savepe')savePe();
 else if(a==='peend')endPe();
 else if(a==='pedel')delPe();
 else if(a==='calopen'){closeSet();openCal()}
 else if(a==='closecal')closeCal();
 else if(a==='caltog'){const k=b.dataset.ck,c=Object.assign({},calS());c[k]=!c[k];S.cal=c;saveSet();calRender()}
 else if(a==='calpick'){const k=b.dataset.key;calSel.has(k)?calSel.delete(k):calSel.add(k);calRender()}
 else if(a==='calgo')calGo();
 else if(a==='prvopen')openPrv();
 else if(a==='closeprv')closePrv();
 else if(a==='privset'){S.priv=b.dataset.v==='1';saveLocal();render();prvRender()}
 else if(a==='privstart'){S.privStart=!S.privStart;saveLocal();prvRender()}
 else if(a==='pinset')lockShow('set1');
 else if(a==='pinchange')lockShow('old');
 else if(a==='pinoff')lockShow('off');
 else if(a==='lkforgot')lkForgot();
 else if(a==='lkcancel'){$('#lock').hidden=true;pinBuf=''}
 else if(a==='logopen'){closeSet();openLog()}
 else if(a==='closelog')closeLog();
 else if(a==='logx'){S.seenVer=APP_VER;saveLocal();render()}
 else if(a==='addgoal')openGoal(null);
 else if(a==='editgoal')openGoal(+b.dataset.id);
 else if(a==='closegoal')closeGoal();
 else if(a==='savegoal')saveGoal();
 else if(a==='delgoal')delGoal();
 else if(a==='deposit')openDep(+b.dataset.id);
 else if(a==='closedep')closeDep();
 else if(a==='savedep')saveDep();
 else if(a==='tipx'){S.tipDone=mk(new Date());try{localStorage.setItem(KEY2,JSON.stringify(S))}catch(x){}render()}
 else if(a==='editcat')openCat(+b.dataset.id);
 else if(a==='closecat')closeCat();
 else if(a==='savecat')saveCat();
 else if(a==='delcat')delCat();
 else if(a==='mode')setHome({mode:b.dataset.v});
 else accDo(a);
});
function setDone(){S.name=$('#s-name').value.trim().slice(0,24);S.lang=$('#s-lang').value;S.cur=$('#s-cur').value;saveSet();cloudName();applyStatic();render();closeSet()}

async function initDb(){
 try{
  if(!(window.claude&&claude.use))return;
  const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);
  if(!db||!user)return;
  const uid=await user.id();if(!uid)return;
  const ref=db.doc('data/users/'+uid+'/ledger');
  const snap=await ref.get();
  DB=ref;
  const d=snap.exists?snap.data():null,ru=d?(+d.u||0):0;
  if(d&&ru>U){
   tx=Array.isArray(d.tx)?d.tx:[];pl=Array.isArray(d.planned)?d.planned:[];subs=Array.isArray(d.subs)?d.subs:[];U=ru;
   if(d.set){
    if(T[d.set.lang])S.lang=d.set.lang;
    if(['RON','EUR','USD','GBP','MDL'].includes(d.set.cur))S.cur=d.set.cur;
    if(typeof d.set.name==='string')S.name=d.set.name.slice(0,24);
   }
   wr();try{localStorage.setItem(KEY2,JSON.stringify(S))}catch(e){}
   applyStatic();
  }else if(U>ru)push();
  render();
 }catch(e){console.error('db',e)}
}



/* ===== Apple Pay: plăți adăugate automat, cu reguli învățate ===== */
const nm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
const apKey=m=>nm(m).split(' ').filter(w=>w&&!/\d/.test(w)).slice(0,3).join(' ');
const apPretty=m=>{const w=String(m).replace(/\s+/g,' ').trim().split(' ').filter(x=>!/\d{3,}/.test(x)).slice(0,5);return w.map(x=>x.length>3&&x===x.toUpperCase()?x.charAt(0)+x.slice(1).toLowerCase():x).join(' ')||String(m)};
const AP_DEF={'Mâncare':'kaufland|lidl|mega image|carrefour|profi|penny|auchan|selgros|cora|mcdonald s|mcdonalds|kfc|starbucks|tazz|glovo|bolt food|pizza|restaurant|cafenea|brutarie|patiserie','Combustibil':'omv|petrom|mol|rompetrol|lukoil|socar|gazprom|peco','Subscripții':'netflix|spotify|youtube|hbo|disney|apple com|itunes|icloud|google one|prime video','Sănătate':'farmacia|farmacie|catena|help net|dr max|sensiblu|dona|clinica|medlife|regina maria|synevo','Cumpărături':'emag|altex|flanco|dedeman|ikea|zara|decathlon|pepco|jysk|leroy merlin|sephora|douglas','Distracție':'cinema|cinemacity|steam|playstation|xbox','Facturi':'digi|orange|vodafone|telekom|engie|enel|electrica|apa nova|rcs'};
function defCat(n){const q=' '+n+' ';for(const k in AP_DEF)for(const p of AP_DEF[k].split('|'))if(q.includes(' '+p+' '))return k;return null}
const bestRule=n=>rules.filter(r=>r.key&&n.startsWith(r.key)).sort((a,b)=>b.key.length-a.key.length)[0];
function parseAmt(v){
 let s=String(v||'').replace(/[^\d.,]/g,'');if(!s)return 0;
 const lc=s.lastIndexOf(','),ld=s.lastIndexOf('.');
 if(lc>-1&&ld>-1)s=lc>ld?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');
 else if(lc>-1){const f=s.split(',');s=(f.length===2&&f[1].length<=2)?s.replace(',','.'):s.replace(/,/g,'')}
 else if(ld>-1){const f=s.split('.');if(!(f.length===2&&f[1].length<=2))s=s.replace(/\./g,'')}
 return Math.round((parseFloat(s)||0)*100)/100;
}
let apM=[];
function apQ(){try{const r=localStorage.getItem(KEYQ);return r?JSON.parse(r):apM}catch(e){return apM}}
function apSave(q){apM=q;try{localStorage.setItem(KEYQ,JSON.stringify(q))}catch(e){}}
const hadCloud=()=>{try{return !!localStorage.getItem(KEY3)}catch(e){return false}};
function apReady(){return !!((C.hid&&C.sync)||(C.booted&&!C.hid&&!hadCloud()))}
const isAnd=()=>/Android/i.test(navigator.userAgent);
if(isAnd()){T.ro.apm='Plăți automate și reguli';T.en.apm='Automatic payments & rules'}
function apFromText(txt){
 const raw=String(txt||'').replace(/\s+/g,' ').trim();
 if(!raw)return null;
 if(/\b(primit|primiți|încasat|incasat|received|refund\w*|ramburs\w*|depunere|salariu|cashback)\b/i.test(raw))return {skip:1};
 const NUM='(\\d{1,3}(?:[.\\s]\\d{3})+(?:,\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)',CUR='(?:RON|LEI|EUR|€|USD|\\$|GBP|£)';
 const m=raw.match(new RegExp(NUM+'\\s*'+CUR,'i'))||raw.match(new RegExp(CUR+'\\s*'+NUM,'i'));
 if(!m)return null;
 const amt=parseAmt(m[1]);if(!(amt>0))return null;
 let rest=raw.replace(m[0],' ');
 const k=rest.match(/(?:^|[\s,;:])(?:la|at|in|în|către|catre|from|merchant|comerciant|@)[\s:]+([\s\S]+)$/i);
 if(k)rest=k[1];
 rest=rest.replace(/\b(?:cu\s+card\w*|with\s+card|using\s+card)\b[\s\S]*$/i,' ').replace(/\bcard\w*\b/gi,' ')
  .replace(/[•*xX]{2,}\s*\d{2,4}/g,' ').replace(/\b\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?\b/g,' ').replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g,' ')
  .replace(/\b(?:plata|plată|plati|plăți|tranzactie|tranzacție|cumparare|cumpărare|achizitie|achiziție|payment|purchase|ai efectuat|ati efectuat|ați efectuat|ai platit|ai plătit|aprobata|aprobată|efectuata|efectuată|google wallet|wallet|pay|paid|you)\b/gi,' ')
  .replace(/[,;:!?()\[\]"]+/g,' ').replace(/\s+/g,' ').trim();
 let mer=(typeof cleanDesc==='function'?cleanDesc(rest):rest).replace(/^[\s.\-–]+|[\s.\-–]+$/g,'').slice(0,80);
 if(!mer)mer='Plată';
 return {amt,mer};
}
function apParse(){
 const dec=v=>{try{return decodeURIComponent(v)}catch(e){return v}};
 let amt=0,mer='',hit=false;
 const q=new URLSearchParams(location.search);
 const nraw=(location.search.match(/[?&]n=([\s\S]*)$/)||[])[1];let nres=null;
 if(nraw!==undefined){hit=true;nres=apFromText(dec(nraw.replace(/\+/g,' ')));if(nres&&!nres.skip){amt=nres.amt;mer=nres.mer}}
 else if(q.has('amt')&&q.has('m')){hit=true;let a=q.get('amt')||'',m=q.get('m')||'';const num=v=>/^[\s\d.,]+$/.test(v);if(!num(a)&&num(m)){const z=a;a=m;m=z}amt=parseAmt(a);mer=String(m).trim().slice(0,80)}
 else{
  const m=location.hash.match(/^#ap\/([^\/]*)\/([\s\S]*)$/);
  if(m){hit=true;amt=parseAmt(dec(m[1]));mer=dec(m[2]).trim().slice(0,80)}
 }
 if(!hit)return;
 try{history.replaceState(null,'',location.pathname)}catch(e){}
 if(amt>0&&mer){const q2=apQ().slice();q2.push({amt,mer,t:Date.now()});apSave(q2)}
 if(nraw!==undefined&&!(amt>0&&mer))setTimeout(()=>toast(`<span style="font-size:24px">${nres&&nres.skip?'↩️':'⚠️'}</span><span><b>${t(nres&&nres.skip?'apNIgn':'apNBad')}</b></span>`,0),2200);
 apRun();
}
function apAdd(amt,mer){
 if(tx.some(x=>x.ap===mer&&x.amt===amt&&Date.now()-x.id<60000))return null;
 const n=nm(mer),r=bestRule(n);
 let cat=null,note=null,own=null,chk=0;
 if(r){cat=r.cat;note=r.note;own=r.own}else{cat=defCat(n);if(!cat)chk=1}
 if(!cat||!cats.some(c=>c.name===cat))cat=cats.some(c=>c.name==='Altele')?'Altele':((cats[0]&&cats[0].name)||'Altele');
 const x={id:Date.now(),type:'exp',amt,cat,date:today(),note:note||apPretty(mer),ap:mer,...(chk?{chk:1}:{}),...(autoPer(today())?{pk:autoPer(today())}:{})};
 if(C.hid){x.own=(own==='shared'||C.mode==='common')?'shared':C.uid;if(x.own==='shared')x.by=C.uid}
 tx.push(x);logAdd('add','exp',{c:cat,m:amt,n:x.note,v:'ap'});save();return x;
}
function apRun(){
 const q=apQ();if(!q.length)return;
 if(!apReady()){if(C.booted)render();return}
 apSave([]);
 let last=null;
 q.forEach(it=>{const r=apAdd(it.amt,it.mer);if(r)last=r});
 render();
 if(last){
  const go=()=>toast(`<span style="font-size:24px">${last.chk?'❓':'✅'}</span><span><b>${esc(last.note)} · ${fmt(last.amt)}</b><small>${last.chk?t('apUnk')+' · '+t('apCheck'):cn(last.cat)+' · '+t('apCheck')}</small></span>`,last.id);
  if(typeof revealed!=='undefined'&&revealed)go();else setTimeout(go,2200);
 }
}
let rchPend=null;
function askRule(old,o){
 const key=apKey(old.ap),ex=rules.find(r=>r.key===key),mer=apPretty(old.ap);
 rchPend=true;
 $('#rch-t').textContent=t(ex?'rchUpdT':'rchNewT');
 $('#rch-p').textContent=t(ex?'rchUpdP':'rchNewP').replace('{m}',mer).replace('{c}',catEm(o.cat)+' '+cn(o.cat));
 $('#rch-b1').textContent=t(ex?'rchUpd':'rchSave');
 $('#rch-b2').textContent=t('rchOnce');
 $('#rch').hidden=false;
}
function closeRch(){$('#rch').hidden=true;rchPend=null}
function applyRuleToPending(mer,cat,note,exceptId){
 const key=apKey(mer);if(!key)return;
 tx.forEach(r=>{
  if(r.id!==exceptId&&r.chk&&r.ap&&apKey(r.ap)===key){r.cat=cat;if(note&&note!==apPretty(mer))r.note=note;delete r.chk}
 });
}
function learnRule(mer,cat,note,own){
 const key=apKey(mer);if(!key)return;
 const o={key,cat,note:(note&&note!==apPretty(mer))?note:'',own:own==='shared'?'shared':''};
 const r=rules.find(x=>x.key===key);
 if(r)Object.assign(r,o);else rules.push({id:Date.now(),...o});
}
function apCard(){
 const q=tx.filter(x=>x.chk).slice(-3).reverse();
 if(!q.length)return '';
 return `<div class="card wchk"><h3>❓ ${t('apChkCard')}</h3>`+q.map(x=>`<div class="pr"><button class="row" data-act="edit" data-id="${x.id}">${ic(x)}<span class="rt"><b>${esc(x.note||x.ap)}</b><small>${t('apUnk')} · ${fd(x.date)}</small></span><em class="r">−${fmt(x.amt)}</em></button><button class="pay apok" data-act="apok" data-id="${x.id}" aria-label="${t('apOk')}" title="${t('apOk')}">✕</button></div>`).join('')+`<p class="hint" style="margin:8px 2px 0">${t('apOkH')}</p>`+'</div>';
}
let toastT=0;
function toast(html,id){
 const el=$('#toast');el.innerHTML=html;el.dataset.id=id||'';el.hidden=false;
 clearTimeout(toastT);toastT=setTimeout(()=>{el.hidden=true},8000);
}
const apLink=()=>location.href.split('#')[0].split('?')[0]+(isAnd()?'?n=':'?amt=');
function openRul(){$('#rul-msg').textContent='';$('#rul').hidden=false;renderRul()}
function closeRul(){$('#rul').hidden=true;armed=''}
let ruEd=null,ruOpen={g:false,r:false};
function renderRul(){
 const el=$('#rul-body');if(!el||$('#rul').hidden)return;
 let h=`<details class="rcomp" data-rk="g"${ruOpen.g?' open':''}><summary>${isAnd()?'🤖 '+t('apCfgA'):'🍎 '+t('apCfg')}</summary><div class="in"><p class="hint">${t(isAnd()?'apIntroA':'apIntro')}</p><p class="hint">${t('apLink')}</p><div class="lnk">${esc(apLink())}</div><div class="btns"><button data-act="copylink">${t('apCopy')}</button><button data-act="aptest">${t('apTest')}</button></div>${isAnd()?`<details class="det"><summary>${t('apNT')}</summary><p class="hint pre">${esc(t('apN'))}</p></details>`:`<details class="det"><summary>${t('apAT')}</summary><p class="hint pre">${esc(t('apA'))}</p></details><details class="det"><summary>${t('apBT')}</summary><p class="hint pre">${esc(t('apB'))}</p></details>`}</div></details>`;
 h+=`<details class="rcomp" data-rk="r"${ruOpen.r?' open':''}><summary>📚 ${t('apRules')} (${rules.length})</summary><div>`;
 if(!rules.length)h+=`<div class="in"><p class="hint">${t('apNoRules')}</p></div>`;
 [...rules].sort((a,b)=>a.key.localeCompare(b.key)).forEach(r=>{
  h+=`<button class="rr" data-act="ruedit" data-id="${r.id}"><span class="rt"><b>${esc(r.key)}</b><small>${esc(catEm(r.cat))} ${esc(cn(r.cat))}${r.note?' · '+esc(r.note):''}${r.own==='shared'?' · '+t('sShared'):''}</small></span><span style="color:var(--muted)">${ruEd===r.id?'⌄':'›'}</span></button>`;
  if(ruEd===r.id){
   h+=`<div class="rred"><label><span>${t('cat')}</span><select id="ru-cat">${cats.filter(c=>c.name!=='Economii').map(c=>`<option value="${esc(c.name)}"${c.name===r.cat?' selected':''}>${esc(c.emoji||'')} ${esc(cn(c.name))}</option>`).join('')}</select></label><label><span>${t('note')}</span><input id="ru-note" maxlength="80" value="${esc(r.note||'')}" autocomplete="off"></label>${C.hid?`<button class="menu" data-act="rushare"><span>${t('sShared')}</span><span>${r.own==='shared'?'✓':'○'}</span></button>`:''}<div class="btns"><button class="pri" data-act="rusave" data-id="${r.id}">${t('save')}</button><button class="${armed==='r'+r.id?'dng':''}" data-act="delrule" data-id="${r.id}">${armed==='r'+r.id?t('apDelQ'):t('del')}</button></div></div>`;
  }
 });
 h+='</div></details>';
 el.innerHTML=h;
}
function delRule(id){
 if(armed!=='r'+id){armed='r'+id;renderRul();return}
 armed='';rules=rules.filter(r=>r.id!==id);save();renderRul();
}
function copyLink(){
 const m=$('#rul-msg');
 (navigator.clipboard?navigator.clipboard.writeText(apLink()):Promise.reject()).then(()=>m.textContent=t('copied')).catch(()=>{m.textContent=apLink()});
}
window.addEventListener('hashchange',apParse);




/* ===== Import CSV de la bancă ===== */
const NOISE=new Set('plata plati card pos tranzactie cumparare achizitie terminal retail comerciant ref tid mid rrn'.split(' '));
const cleanDesc=x=>{let w=String(x||'').replace(/[*_]+/g,' ').replace(/\s+/g,' ').trim().split(' ');while(w.length>1&&NOISE.has(nm(w[0])))w.shift();const r=w.filter(y=>!/\d{4,}/.test(y)).join(' ').slice(0,80);return r||String(x||'').slice(0,80)};
let csvRows=[],csvHead=0,csvMap={},csvOpt={neg:true,dup:true,flag:true,dmy:true};
function parseCSV(txt){
 const sample=txt.split(/\r?\n/).slice(0,8).join('\n'),cnt=ch=>sample.split(ch).length-1;
 let d=',';if(cnt(';')>cnt(d))d=';';if(cnt('\t')>cnt(d))d='\t';
 const rows=[];let row=[],cur='',q=false;
 for(let i=0;i<txt.length;i++){
  const ch=txt[i];
  if(q){if(ch==='"'){if(txt[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}
  else if(ch==='"')q=true;
  else if(ch===d){row.push(cur);cur=''}
  else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&txt[i+1]==='\n')i++;row.push(cur);cur='';if(row.some(v=>v.trim()!==''))rows.push(row);row=[]}
  else cur+=ch;
 }
 if(cur!==''||row.length){row.push(cur);if(row.some(v=>v.trim()!==''))rows.push(row)}
 return rows;
}
function findHead(rows){
 const HK=/data|date|descri|detal|suma|amount|debit|credit|valoare|merchant|beneficiar|explica|moneda|currency|sold|balance|started|completed|payee|referin|reference/i;
 for(let i=0;i<Math.min(rows.length,40);i++){const hits=rows[i].filter(c=>HK.test(c)&&!/\d{2}[.\/-]\d{2}/.test(c)).length;if(hits>=3)return i}
 return 0;
}
function guessMap(h){
 const ix=re=>h.findIndex(c=>re.test(c));
 const m={date:-1,desc:-1,amt:-1,deb:-1,cre:-1,cur:-1,st:-1,descs:[]};
 m.date=ix(/completed|data.*(tranzac|oper|proces)|transaction.*date|booking|posting/i);
 if(m.date<0)m.date=ix(/^data$|^date$|started|data|date/i);
 m.deb=ix(/^debit|retras|plati|withdraw|money out|paid out/i);
 m.cre=ix(/^credit|incas|depuner|deposit|money in|paid in/i);
 if(m.deb>=0&&m.cre>=0&&m.deb===m.cre)m.cre=-1;
 m.amt=ix(/^suma$|^amount$|^valoare|suma tranzac|^sum$/i);
 if(m.amt<0&&m.deb<0&&m.cre<0)m.amt=ix(/suma|amount|valoare/i);
 m.cur=ix(/currency|moneda|valuta/i);m.st=ix(/^state$|^status$|stare/i);
 h.forEach((c,i)=>{if(/descri|detal|explica|merchant|beneficiar|payee|narrati/i.test(c)&&m.descs.length<2)m.descs.push(i)});
 if(!m.descs.length){const r=ix(/referin|reference|ordonator/i);if(r>=0)m.descs.push(r)}
 m.desc=m.descs.length?m.descs[0]:-1;
 return m;
}
function parseDateStr(x){
 x=String(x||'').trim();let m=x.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/),y,mo,d;
 if(m){y=+m[1];mo=+m[2];d=+m[3]}
 else{m=x.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/);if(!m)return null;const a=+m[1],b=+m[2];y=+m[3];if(y<100)y+=2000;
  if(a>12){d=a;mo=b}else if(b>12){mo=a;d=b}else if(csvOpt.dmy){d=a;mo=b}else{mo=a;d=b}}
 if(y<2000||y>2100||mo<1||mo>12||d<1||d>31)return null;
 return y+'-'+p2(mo)+'-'+p2(d);
}
function csvInterp(r){
 const g=i=>(i>=0&&i<r.length)?String(r[i]).trim():'';
 const date=parseDateStr(g(csvMap.date));
 let amt=0,exp=true;
 if(csvMap.deb>=0||csvMap.cre>=0){
  const dv=parseAmt(g(csvMap.deb)),cv=parseAmt(g(csvMap.cre));
  if(dv>0&&!(cv>0)){amt=dv;exp=true}else if(cv>0&&!(dv>0)){amt=cv;exp=false}else if(dv>0&&cv>0){amt=Math.abs(cv-dv);exp=dv>=cv}
 }else if(csvMap.amt>=0){
  const raw=g(csvMap.amt),neg=/^[-−(]/.test(raw)||/-\s*$/.test(raw);
  amt=parseAmt(raw);exp=csvOpt.neg?neg:!neg;
 }
 const desc=(csvMap.descs||[]).map(g).filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
 return {date,amt,exp,desc,cur:g(csvMap.cur).toUpperCase(),st:g(csvMap.st)};
}
function csvBuild(){
 const rows=csvRows.slice(csvHead+1,csvHead+3001),items=[];
 let bad=0,other=0,stt=0,dup=0;
 const pool=tx.map(x=>({x,used:false})),have=new Set(tx.filter(x=>x.ik).map(x=>x.ik)),occ={},stamps=[];
 const dd=(a,b)=>Math.abs((new Date(a+'T00:00:00')-new Date(b+'T00:00:00'))/864e5);
 const base=Date.now();
 rows.forEach(r=>{
  const v=csvInterp(r);
  if(!v.date||!(v.amt>0)){bad++;return}
  if(v.cur&&v.cur!==S.cur){other++;return}
  if(/revert|declin|fail|cancel|pending|respins|refuz|anulat|asteptare|așteptare/i.test(v.st)){stt++;return}
  const type=v.exp?'exp':'inc';
  const cd=cleanDesc(v.desc)||(v.exp?'—':'Venit');
  const bk=v.date+'|'+type+'|'+v.amt.toFixed(2)+'|'+nm(cd).slice(0,40);
  occ[bk]=(occ[bk]||0)+1;
  const ik=bk+'#'+occ[bk];
  if(csvOpt.dup){
   if(have.has(ik)){dup++;return}
   const hit=pool.find(q=>!q.used&&q.x.type===type&&Math.abs(q.x.amt-v.amt)<.005&&dd(q.x.date,v.date)<=1);
   if(hit){hit.used=true;dup++;if(!hit.x.ik)stamps.push([hit.x,ik]);return}
  }
  let cat,note,chk=0,own=null;
  if(v.exp){
   const n=nm(cd),rl=bestRule(n);
   if(rl){cat=rl.cat;note=rl.note;own=rl.own}else{cat=defCat(n);if(!cat&&csvOpt.flag)chk=1}
   if(!cat||!cats.some(c=>c.name===cat))cat=cats.some(c=>c.name==='Altele')?'Altele':((cats[0]&&cats[0].name)||'Altele');
   note=note||apPretty(cd);
  }else{cat=/salar|salary|wage/i.test(v.desc)?'Salariu':'Altele';note=cd==='Venit'?'':apPretty(cd)}
  const x={id:base+items.length,type,amt:v.amt,cat,date:v.date,note:note||'',ik,...(v.exp?{ap:cd}:{}),...(chk?{chk:1}:{}),...(v.exp&&autoPer(v.date)?{pk:autoPer(v.date)}:{})};
  if(C.hid){x.own=(own==='shared'||C.mode==='common')?'shared':C.uid;if(x.own==='shared'&&v.exp)x.by=C.uid}
  items.push(x);
 });
 return {items,bad,other,stt,dup,stamps};
}
function csvRender(){
 const el=$('#csv-body'),go=$('#csv-go');if(!el)return;
 if(!csvRows.length){
  go.hidden=true;
  el.innerHTML=`<p class="hint">${t('csvIntro')}</p><label class="filebtn">${t('csvPick')}<input type="file" id="csv-file" accept=".csv,.tsv,.txt,text/csv,text/plain,text/tab-separated-values"></label><p class="hint">${t('csvPaste')}</p><textarea id="csv-text" rows="4" spellcheck="false"></textarea><div class="btns"><button data-act="csvparse">${t('csvNext')}</button></div>`;
  return;
 }
 const head=csvRows[csvHead]||[];
 const opts=cur=>`<option value="-1">${t('cNone')}</option>`+head.map((hh,i)=>`<option value="${i}"${cur===i?' selected':''}>${esc((hh||('#'+(i+1))).slice(0,30))}</option>`).join('');
 const sel=(k,l)=>`<label><span>${l}</span><select data-csvm="${k}">${opts(csvMap[k])}</select></label>`;
 const tog=(k,l)=>`<button class="menu" data-act="csvtog" data-ct="${k}"><span>${l}</span><span>${csvOpt[k]?'✓':'○'}</span></button>`;
 const B=csvBuild(),ne=B.items.filter(x=>x.type==='exp').length,ni=B.items.length-ne;
 let h=`<p class="hint">${t('csvCols')}</p>`+sel('date',t('cDate'))+sel('desc',t('cDesc'))+sel('amt',t('cAmt'))+sel('deb',t('cDeb'))+sel('cre',t('cCre'));
 h+=`<label><span>${t('csvFmt')}</span><select id="csv-dmy"><option value="1"${csvOpt.dmy?' selected':''}>${t('csvDmy')}</option><option value="0"${csvOpt.dmy?'':' selected'}>${t('csvMdy')}</option></select></label>`;
 h+=tog('neg',t('csvNeg'))+tog('dup',t('csvDup'))+tog('flag',t('csvFlag'));
 h+=`<h3 style="margin:14px 0 4px;font-size:16px">${t('csvPrev')}</h3><p class="note"><b>${t('csvSum').replace('{n}',B.items.length).replace('{e}',ne).replace('{i}',ni)}</b></p><p class="note">${t('csvSkip').replace('{d}',B.dup).replace('{b}',B.bad).replace('{o}',B.other).replace('{s}',B.stt)}</p>`;
 if(!B.items.length)h+=`<p class="hint">${t('csvEmpty')}</p>`;
 B.items.slice(0,6).forEach(x=>{h+=`<div class="cpv"><span>${fd(x.date)} · ${esc(catEm(x.cat))} ${esc(x.note||x.cat)}${x.chk?' ❓':''}</span><b class="${x.type==='inc'?'g':'r'}">${x.type==='inc'?'+':'−'}${fmt(x.amt)}</b></div>`});
 el.innerHTML=h;go.hidden=!B.items.length;go.textContent=t('csvGo');
}
function openCsv(){csvRows=[];$('#csv-msg').textContent='';$('#csv').hidden=false;csvRender()}
function closeCsv(){$('#csv').hidden=true;csvRows=[]}
function csvLoad(txt){
 const rows=parseCSV(String(txt||'').replace(/^\uFEFF/,''));
 if(rows.length<2){$('#csv-msg').textContent=t('csvRead');return}
 csvRows=rows;csvHead=findHead(rows);csvMap=guessMap(rows[csvHead]);
 const sm=rows.slice(csvHead+1,csvHead+40).map(r=>String(r[csvMap.date]||'').trim()).find(x=>/^\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}/.test(x));
 $('#csv-msg').textContent='';csvRender();
}
async function csvFile(f){
 try{
  const buf=await f.arrayBuffer();
  let txt=new TextDecoder('utf-8').decode(buf);
  if(txt.includes('\uFFFD')){try{txt=new TextDecoder('windows-1250').decode(buf)}catch(e){}}
  csvLoad(txt);
 }catch(e){console.error(e);$('#csv-msg').textContent=t('csvRead')}
}
function csvImport(){
 const B=csvBuild();if(!B.items.length){if((B.stamps||[]).length){B.stamps.forEach(([x,ik])=>{x.ik=ik});save()}return}
 snapU();B.items.forEach(x=>tx.push(x));
 (B.stamps||[]).forEach(([x,ik])=>{x.ik=ik});
 logAdd('imp','csv',{n:B.items.length});
 const last=B.items.map(x=>x.date).sort().pop();
 save();closeCsv();closeSet();
 view=new Date(last+'T00:00:00');view.setDate(1);
 render();
 const chk=B.items.filter(x=>x.chk).length;
 toast(`<span style="font-size:24px">📥</span><span><b>${t('csvDone').replace('{n}',B.items.length)}</b>${chk?`<small>❓ ${chk}</small>`:''}</span>`,0);
}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.dataset&&d.dataset.rk)ruOpen[d.dataset.rk]=d.open},true);
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.id==='csv-file'&&el.files&&el.files[0])csvFile(el.files[0]);
 else if(el.dataset&&el.dataset.csvm){const k=el.dataset.csvm,v=+el.value;csvMap[k]=v;if(k==='desc')csvMap.descs=v>=0?[v]:[];csvRender()}
 else if(el.id==='pe-pre')peApplyPre(+el.value);
 else if(el.id==='f-date'){const w=$('#perw');if(w&&!w.hidden&&!edId)perSync()}
 else if(el.id==='cal-h'){S.cal=Object.assign({},calS(),{h:+el.value});saveSet()}
 else if(el.id==='csv-dmy'){csvOpt.dmy=el.value==='1';csvRender()}
});

/* ===== Jurnal de activitate ===== */
function logAdd(a,k,o){
 const t0=Date.now();
 logs.push({id:t0*1000+Math.floor(Math.random()*1000),t:t0,u:C.uid||'me',a,k,...o});
 if(logs.length>100)logs=logs.sort((x,y)=>y.t-x.t).slice(0,100);
}
const actorName=u=>(!C.hid||u===C.uid||u==='me')?t('lgYou'):(C.names[u]||pname());
function logText(e){
 const who=`<b>${esc(actorName(e.u))}</b>`;
 if(e.k==='csv')return `${who} ${t('lgImp').replace('{n}',e.n)}`;
 if(e.k==='goal')return `${who} ${t('lgDep').replace('{g}',esc(e.g))} · ${fmt(e.m)}`;
 const noun={exp:'lgExp',inc:'lgInc',plan:'lgPlan',sub:'lgSub'}[e.k]||'lgExp',verb={add:'lgAdd',edit:'lgEdit',del:'lgDel',paid:'lgPaid'}[e.a]||'lgAdd';
 return `${who} ${t(verb)} ${t(noun)}: ${esc(catEm(e.c))} ${esc(cn(e.c))} · ${fmt(e.m)}${e.n&&e.n!==e.c?' · '+esc(e.n):''}${e.v==='ap'?' · '+(isAnd()?t('apTag'):'Apple Pay'):''}`;
}
function renderJrn(){
 const el=$('#jrn-body');if(!el)return;
 const q=[...logs].sort((a,b)=>b.t-a.t);
 if(!q.length){el.innerHTML=`<p class="empty">${t('jrnNone')}</p>`;return}
 let h='',dk='';
 q.forEach(e=>{
  const d=new Date(e.t),iso=mk(d)+'-'+p2(d.getDate());
  if(iso!==dk){dk=iso;h+=`<div class="day">${dayLbl(iso)}</div>`}
  const mine=!C.hid||e.u===C.uid||e.u==='me',nm0=actorName(e.u);
  h+=`<div class="jrow"><i class="av" style="background:${mine?'var(--accent)':'#7c3aed'}">${esc(nm0.charAt(0).toUpperCase())}</i><span class="rt"><span>${logText(e)}</span><small>${d.toLocaleTimeString(loc(),{hour:'2-digit',minute:'2-digit'})}</small></span></div>`;
 });
 el.innerHTML=h;
}
function openJrn(){renderJrn();$('#jrn').hidden=false}
function closeJrn(){$('#jrn').hidden=true}

/* ===== v2.0: efecte (cifre, bare, confetti, dock) ===== */
const cuPrev={},reduceM=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
function animNums(){
 const rm=reduceM();
 document.querySelectorAll('[data-cu]').forEach(el=>{
  const k=el.dataset.cuk,to=+el.dataset.cu,from=cuPrev[k]!=null?cuPrev[k]:0;
  cuPrev[k]=to;
  if(S.priv||rm||from===to||!isFinite(to))return;
  const t0=performance.now(),D=650;
  const step=n=>{
   if(!el.isConnected)return;
   const p=Math.min(1,(n-t0)/D),e=1-Math.pow(1-p,3);
   el.textContent=fmt(p<1?from+(to-from)*e:to);
   if(p<1)requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
 });
}
function barsIn(root){
 if(reduceM())return;
 (root||document).querySelectorAll('.tr i').forEach(b=>{
  const w=b.style.width;if(!w)return;
  b.style.transition='none';b.style.width='0%';b.getBoundingClientRect();
  b.style.transition='width .75s cubic-bezier(.22,.8,.3,1)';
  requestAnimationFrame(()=>{b.style.width=w});
 });
}
function confetti(){
 if(reduceM())return;
 const c=document.createElement('div');c.className='cf';
 const cols=['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#ef4444'];
 for(let i=0;i<46;i++){
  const q=document.createElement('i');
  q.style.cssText=`left:${50+(Math.random()-.5)*20}%;background:${cols[i%6]};--dx:${((Math.random()-.5)*360).toFixed(0)}px;--dy:${(-120-Math.random()*260).toFixed(0)}px;--rot:${(Math.random()*720).toFixed(0)}deg;animation-delay:${(Math.random()*.15).toFixed(2)}s`;
  c.appendChild(q);
 }
 document.body.appendChild(c);setTimeout(()=>c.remove(),2300);
}
function budChip(){
 try{
  const ym=mk(view),w=wal();
  const alloc=cats.reduce((a,c)=>a+bud(c,ym,w),0);
  if(!(alloc>0))return '';
  const sp=cats.reduce((a,c)=>a+spentIn(c.name,ym),0),r=sp/alloc;
  const st=r>1?['bsOver','#fca5a5']:r>=.8?['bsNear','#fcd34d']:['bsOk','#86efac'];
  return `<div class="chip" style="--dot:${st[1]}">${t(st[0])} · ${Math.round(r*100)}%</div>`;
 }catch(e){return ''}
}
(function(){
 const dock=document.querySelector('.dock');if(!dock)return;
 let act=false,pid=null,x0=0,moved=false,cur=0;
 const geo=()=>{const r=dock.getBoundingClientRect(),W=(r.width-18)/3;return {l:r.left+5,W,step:W+4}};
 const posOf=x=>{const g=geo();return Math.min(2,Math.max(0,(x-g.l-g.W/2)/g.step))};
 const marks=k=>document.querySelectorAll('.dock button').forEach((b,i)=>b.classList.toggle('on',i===k));
 function live(p,follow){
  marks(Math.round(p));
  if(follow){
   ind(p,false);
   const tr=$('#trk');
   if(tr){offAll(false);tr.style.transition='none';tr.style.transform=`translateX(${-p*100/3}%)`}
  }else ind(Math.round(p),true);
 }
 dock.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  act=true;moved=false;x0=e.clientX;pid=e.pointerId;
  try{dock.setPointerCapture(pid)}catch(_){}
  dock.classList.add('drag');
  cur=posOf(e.clientX);live(cur,false);
 });
 dock.addEventListener('pointermove',e=>{
  if(!act)return;
  if(!moved&&Math.abs(e.clientX-x0)>5)moved=true;
  cur=posOf(e.clientX);
  if(moved)live(cur,true);
 });
 const end=()=>{
  if(!act)return;act=false;
  dock.classList.remove('drag');
  try{dock.releasePointerCapture(pid)}catch(_){}
  const k=Math.round(cur);
  switchTab(TABS[k]);
 };
 dock.addEventListener('pointerup',end);
 dock.addEventListener('pointercancel',end);
})();

/* ===== Raport erori (ecran) ===== */
function openErr(){errRender();$('#err-msg').textContent='';$('#erp').hidden=false}
function closeErr(){$('#erp').hidden=true}
function errRender(){
 const el=$('#err-body');if(!el)return;
 const q=ERR.list().slice().reverse(),un=q.filter(x=>!x.sent).length,cloud=!!(C&&C.fb&&C.uid);
 let h=`<p class="hint">${t('erIntro')}</p><p class="hint">${t('erPriv')}</p><button class="menu" data-act="errauto"><span>${t('erAuto')}</span><span>${S.errAuto===false?'○':'✓'}</span></button>`;
 if(!cloud)h+=`<p class="hint">${t('erNoCloud')}</p>`;
 if(!q.length)h+=`<p class="hint">${t('erNone')}</p>`;
 else{
  h+=q.slice(0,15).map(x=>`<div class="erit"><b>${esc(x.m)}</b><small>${new Date(x.t).toLocaleString(loc())} · v${esc(x.v)} · ${esc(x.k)}${x.n>1?' ×'+x.n:''} · ${x.sent?'✓ '+t('erSent'):'○ '+t('erNot')}</small></div>`).join('');
  h+=`<div class="btns"><button data-act="errcopy">${t('erCopy')}</button>${cloud&&un?`<button data-act="errsend">${t('erSend')} (${un})</button>`:''}</div><textarea id="err-txt" readonly spellcheck="false">${esc(ERR.text())}</textarea>`;
 }
 h+=`<div class="btns"><button data-act="errtest">${t('erTest')}</button>${q.length?`<button data-act="errclear">${t('erClear')}</button>`:''}</div>`;
 el.innerHTML=h;
}
window.errRender=errRender;
async function errCopy(){
 const tx_=ERR.text(),m=$('#err-msg');
 try{await navigator.clipboard.writeText(tx_);m.textContent=t('erCopied');return}catch(e){}
 try{const a=$('#err-txt');a.focus();a.select();if(document.execCommand('copy')){m.textContent=t('erCopied');return}}catch(e){}
 m.textContent=t('erCopyFail');
}

/* ===== Vacanță și sezoane ===== */
function perBudCard(){
 const td=today(),act=per.filter(p=>perSt(p,td)!=='done').sort((a,b)=>a.start.localeCompare(b.start)),done=per.length-act.length;
 let h=`<div class="card bcard"><h3><span>🧳 ${t('perT')}</span></h3>`;
 if(!act.length)h+=`<p class="hint">${t('perNoneYet')}</p>`;
 act.forEach(p=>{
  const st=perSt(p,td),sp=perSpent(p),pct=p.budget>0?Math.min(100,sp/p.budget*100):0,over=p.budget>0&&sp>p.budget;
  const when=st==='act'?t('perDay').replace('{d}',dayDiff(p.start,td)+1).replace('{n}',dayDiff(p.start,p.end)+1):(()=>{const k=dayDiff(td,p.start);return k===1?t('perStartsT'):t('perStarts').replace('{n}',k)})();
  h+=`<button class="brow" data-act="peedit" data-id="${p.id}"><i class="ic" style="background:var(--bd)">${esc(p.emoji||'✨')}</i><span class="bm"><span class="bl2"><b>${esc(p.name)}</b><span>${p.budget>0?nf(sp)+' / '+fmt(p.budget):fmt(sp)}</span></span>${p.budget>0?`<span class="tr"><i style="width:${pct}%;background:${over?'var(--r)':'var(--accent)'}"></i></span>`:''}<small>${fd(p.start)} – ${fd(p.end)} · ${when}</small></span></button>`;
 });
 h+=`<button class="plt" data-act="peedit">${t('perAdd')}</button>`;
 if(done)h+=`<button class="plt" data-act="peropen">${t('perDoneN').replace('{n}',done)}</button>`;
 return h+'</div>';
}
const dstr=d=>mk(d)+'-'+p2(d.getDate());
const dayDiff=(a,b)=>Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5);
const perSt=(p,td)=>{td=td||today();return td<p.start?'up':td>p.end?'done':'act'};
const autoPer=d=>{const p=per.find(x=>d>=x.start&&d<=x.end);return p?p.id:0};
const perEm=id=>{const p=per.find(x=>x.id===id);return p?(p.emoji||'✨'):'🧳'};
const perSpent=p=>{let a=0;tx.forEach(x=>{if(x.type==='exp'&&x.pk===p.id)a+=share(x,x.date.slice(0,7))});return a};
function perSync(sel,editing){
 const w=$('#perw'),el=$('#f-per');if(!w||!el)return;
 const td=today(),d=$('#f-date')?$('#f-date').value||td:td;
 const opts=per.filter(p=>perSt(p,td)!=='done'||p.id===sel).sort((a,b)=>a.start.localeCompare(b.start));
 if(type!=='exp'||!opts.length){w.hidden=true;return}
 const cur=sel!=null?sel:(editing?0:autoPer(d));
 el.innerHTML=`<option value="0">${t('perNone')}</option>`+opts.map(p=>`<option value="${p.id}"${p.id===cur?' selected':''}>${esc(p.emoji||'✨')} ${esc(p.name)}</option>`).join('');
 w.hidden=false;
}
function perCard(){
 const td=today(),out=[];
 per.forEach(p=>{const st=perSt(p,td);if(st==='act'||(st==='up'&&dayDiff(td,p.start)<=7))out.push({p,st})});
 if(!out.length)return '';
 return out.map(({p,st})=>{
  const sp=perSpent(p),n=dayDiff(p.start,p.end)+1;
  let sub='',bar='';
  if(st==='up'){const k=dayDiff(td,p.start);sub=k===1?t('perStartsT'):t('perStarts').replace('{n}',k)}
  else{
   const d=dayDiff(p.start,td)+1,left=dayDiff(td,p.end)+1;
   sub=t('perDay').replace('{d}',d).replace('{n}',n);
   if(p.budget>0){
    const rem=p.budget-sp;
    sub+=' · '+(rem<0?t('perOver').replace('{a}',fmt(-rem)):t('perLeft').replace('{a}',fmt(rem/left)));
    bar=`<div class="tr"><i style="width:${Math.min(100,sp/p.budget*100)}%;background:${stCol(sp,p.budget)||'var(--accent)'}"></i></div>`;
   }
  }
  return `<button class="card percard" data-act="peedit" data-id="${p.id}"><h3><span>${esc(p.emoji||'✨')} ${esc(p.name)}</span><span>${p.budget>0?nf(sp)+' / '+fmt(p.budget):fmt(sp)}</span></h3>${bar}<p class="note">${sub}</p></button>`;
 }).join('');
}
function openPer(){perRender();$('#per').hidden=false}
function closePer(){$('#per').hidden=true}
function perRender(){
 const el=$('#per-body');if(!el)return;
 const td=today();
 if(!per.length){el.innerHTML=`<p class="hint">${t('perNoneYet')}</p><button class="plt" data-act="peedit">${t('perAdd')}</button>`;return}
 const grp=(st,l)=>{
  const q=per.filter(p=>perSt(p,td)===st).sort((a,b)=>st==='done'?b.end.localeCompare(a.end):a.start.localeCompare(b.start));
  if(!q.length)return '';
  return `<p class="hint"><b>${l}</b></p>`+q.map(p=>{const sp=perSpent(p);return `<button class="menu" data-act="peedit" data-id="${p.id}"><span>${esc(p.emoji||'✨')} ${esc(p.name)}<br><small>${fd(p.start)} – ${fd(p.end)} · ${t('perSpent')}: ${fmt(sp)}${p.budget>0?' / '+fmt(p.budget):' · '+t('perNoBud')}</small></span><span>›</span></button>`}).join('');
 };
 el.innerHTML=grp('act',t('perAct'))+grp('up',t('perUp'))+grp('done',t('perDone'))+`<button class="plt" data-act="peedit">${t('perAdd')}</button>`;
}
let peId=null;
function perPresets(){
 const y=new Date().getFullYear(),td=today(),nx=(m1,d1,m2,d2)=>{let a=y+'-'+p2(m1)+'-'+p2(d1),b=(m2<m1?y+1:y)+'-'+p2(m2)+'-'+p2(d2);if(b<td){a=(y+1)+'-'+p2(m1)+'-'+p2(d1);b=(m2<m1?y+2:y+1)+'-'+p2(m2)+'-'+p2(d2)}return [a,b]};
 const wk=new Date();wk.setDate(wk.getDate()+6);
 return [
  {k:'vac',name:t('perVac'),emoji:'✈️',range:[td,dstr(wk)]},
  {k:'sez',name:t('perXmas'),emoji:'🎄',range:nx(12,1,12,26)},
  {k:'sez',name:t('perNY'),emoji:'🎆',range:nx(12,27,1,2)},
  {k:'sez',name:t('perBF'),emoji:'🛍️',range:nx(11,20,11,30)},
  {k:'sez',name:t('perSch'),emoji:'🎒',range:nx(8,25,9,15)},
  {k:'sez',name:t('perCust'),emoji:'✨',range:[td,td]}
 ];
}
function openPe(id){
 peId=id||null;armed='';
 const p=id?per.find(x=>x.id===id):null;
 $('#pe-title').textContent=t(p?'perEdit':'perNew');
 const pre=perPresets();
 $('#pe-pre').innerHTML=pre.map((x,i)=>`<option value="${i}">${x.emoji} ${esc(x.name)}</option>`).join('');
 $('#pe-prw').hidden=!!p;
 const f=n=>n?String(n).replace('.',S.lang==='en'?'.':','):'';
 if(p){$('#pe-name').value=p.name;$('#pe-emo').value=p.emoji||'';$('#pe-from').value=p.start;$('#pe-to').value=p.end;$('#pe-bud').value=f(p.budget)}
 else peApplyPre(0);
 const dl=$('#pe-del');dl.hidden=!p;dl.textContent=t('perDel');dl.classList.remove('dng');
 const en=$('#pe-end');en.hidden=!(p&&perSt(p)==='act');en.textContent=t('perEndNow');
 $('#pe-err').textContent='';$('#perE').hidden=false;
}
function peApplyPre(i){
 const x=perPresets()[i];if(!x)return;
 $('#pe-name').value=x.name;$('#pe-emo').value=x.emoji;$('#pe-from').value=x.range[0];$('#pe-to').value=x.range[1];$('#pe-bud').value='';
}
function closePe(){$('#perE').hidden=true;peId=null;armed=''}
function savePe(){
 const name=$('#pe-name').value.trim().slice(0,30),emo=($('#pe-emo').value.trim()||'✨').slice(0,4),a=$('#pe-from').value,b=$('#pe-to').value;
 const bv=$('#pe-bud').value.trim(),bud=bv?numIn(bv):0;
 if(!name||!/^\d{4}-\d{2}-\d{2}$/.test(a)||!/^\d{4}-\d{2}-\d{2}$/.test(b)||a>b||isNaN(bud)||bud<0)return $('#pe-err').textContent=t('perBad');
 const kind=(peId?(per.find(x=>x.id===peId)||{}).kind:perPresets()[+$('#pe-pre').value].k)||'sez';
 if(peId){const p=per.find(x=>x.id===peId);if(p)Object.assign(p,{name,emoji:emo,start:a,end:b,budget:bud})}
 else per.push({id:Date.now(),kind,name,emoji:emo,start:a,end:b,budget:bud});
 save();closePe();perRender();render();
}
function endPe(){
 const p=per.find(x=>x.id===peId);if(!p)return;
 const td=today();p.end=td<p.start?p.start:td;save();closePe();perRender();render();
}
function delPe(){
 const b=$('#pe-del');
 if(armed!=='pdel'){armed='pdel';b.textContent=t('sure');b.classList.add('dng');return}
 per=per.filter(x=>x.id!==peId);tx.forEach(x=>{if(x.pk===peId)delete x.pk});save();closePe();perRender();render();
}

/* ===== Reminder în calendar (.ics) ===== */
let calSel=null;
const calS=()=>Object.assign({d0:true,d1:true,d3:false,d7:false,h:9},S.cal||{});
function calItems(){
 const td=today(),ym=mk(new Date()),out=[];
 pl.filter(x=>x.date>=td&&vis(x)).forEach(x=>out.push({key:'p'+x.id,kind:'plan',id:x.id,amt:x.amt,cat:x.cat,note:x.note,date:x.date}));
 subs.filter(sb=>vis(sb)).forEach(sb=>{
  let m=ym<sb.from?sb.from:ym,d=dueOf(sb,m);
  if(d<td||(m===ym&&paidSub(sb,m))){const n=new Date(+m.slice(0,4),+m.slice(5,7),1);m=mk(n);d=dueOf(sb,m)}
  out.push({key:'s'+sb.id,kind:'sub',id:sb.id,amt:sb.amt,cat:sb.cat,note:sb.note,date:d,day:sb.day});
 });
 return out.sort((a,b)=>a.date.localeCompare(b.date));
}
function openCal(){calSel=new Set(calItems().map(x=>x.key));calRender();$('#cal-msg').textContent='';$('#cal').hidden=false}
function closeCal(){$('#cal').hidden=true}
function calRender(){
 const el=$('#cal-body');if(!el)return;
 const c=calS(),it=calItems(),go=$('#cal-go');
 if(go)go.hidden=!it.length;
 const tog=(k,l)=>`<button class="menu" data-act="caltog" data-ck="${k}"><span>${l}</span><span>${c[k]?'✓':'○'}</span></button>`;
 let h=`<p class="hint">${t('calIntro')}</p><p class="hint"><b>${t('calWhen')}</b></p>`+tog('d0',t('calD0'))+tog('d1',t('calD1'))+tog('d3',t('calD3'))+tog('d7',t('calD7'));
 let ho='';for(let i=6;i<=22;i++)ho+=`<option value="${i}"${c.h===i?' selected':''}>${p2(i)}:00</option>`;
 h+=`<label><span>${t('calHour')}</span><select id="cal-h">${ho}</select></label><p class="hint"><b>${t('calWhat')}</b></p>`;
 if(!it.length)h+=`<p class="hint">${t('calNone')}</p>`;
 else h+=it.map(x=>`<button class="menu" data-act="calpick" data-key="${x.key}"><span>${x.kind==='sub'?'🔁 ':''}${esc(cn(x.cat))}${x.note?' · '+esc(x.note):''} · ${fmtR(x.amt)}<br><small>${x.kind==='sub'?t('calMonthly').replace('{d}',x.day):fd(x.date)}</small></span><span>${calSel.has(x.key)?'✓':'○'}</span></button>`).join('')+`<p class="hint">${t('calHow')}</p>`;
 el.innerHTML=h;
}
const icsEsc=v=>String(v).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
function icsFold(l){let o='';while(l.length>72){o+=l.slice(0,72)+'\r\n ';l=l.slice(72)}return o+l}
function calIcs(){
 const c=calS(),its=calItems().filter(x=>calSel.has(x.key));
 const al=[];if(c.d0)al.push(0);if(c.d1)al.push(1);if(c.d3)al.push(3);if(c.d7)al.push(7);
 if(!al.length){$('#cal-msg').textContent=t('calNoAl');return ''}
 if(!its.length){$('#cal-msg').textContent=t('calNoSel');return ''}
 const hh=p2(c.h),now=new Date(),stamp=now.getUTCFullYear()+p2(now.getUTCMonth()+1)+p2(now.getUTCDate())+'T'+p2(now.getUTCHours())+p2(now.getUTCMinutes())+p2(now.getUTCSeconds())+'Z';
 const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Cheltuieli//RO','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 its.forEach(x=>{
  const d=x.date.replace(/-/g,''),title=(x.kind==='sub'?'🔁 ':'💳 ')+(x.kind==='sub'?t('calSub'):t('calPay'))+': '+cn(x.cat)+(x.note?' – '+x.note:'')+' · '+fmtR(x.amt);
  L.push('BEGIN:VEVENT','UID:cheltuieli-'+x.key+'@cheltuieli.app','DTSTAMP:'+stamp,'DTSTART:'+d+'T'+hh+'0000','DTEND:'+d+'T'+hh+'3000','SUMMARY:'+icsEsc(title),'DESCRIPTION:'+icsEsc(fmtR(x.amt)+' · '+cn(x.cat)));
  if(x.kind==='sub'){const n=Math.min(x.day,31);L.push('RRULE:FREQ=MONTHLY;BYMONTHDAY='+(n<=28?n:Array.from({length:n-27},(_,i)=>28+i).join(','))+(n>28?';BYSETPOS=-1':''))}
  al.forEach(n=>L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(title),'TRIGGER:'+(n?'-P'+n+'D':'PT0S'),'END:VALARM'));
  L.push('END:VEVENT');
 });
 L.push('END:VCALENDAR');
 return L.map(icsFold).join('\r\n')+'\r\n';
}
async function calGo(){
 const ics=calIcs();if(!ics)return;
 $('#cal-msg').textContent='';
 const name='plati-cheltuieli.ics';
 try{
  const f=new File([ics],name,{type:'text/calendar'});
  if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return}
 }catch(e){if(e&&e.name==='AbortError')return}
 const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));
 const apple=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 if(apple){
  // pe iPhone, Safari deschide fișierul .ics și oferă direct „Adaugă la Calendar”
  const w=window.open(url,'_blank');
  if(!w)location.href=url;
  $('#cal-msg').textContent=t('calOpen');
 }else{
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  $('#cal-msg').textContent=t('calDone');
 }
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}

/* ===== Jurnal actualizări + mod confidențial ===== */
const APP_VER='2.6';
const CHANGELOG=[
 {v:'2.6',d:'2026-10-14',ro:['Android: plăți automate din notificări sau SMS, cu MacroDroid; aplicația citește singură suma și comerciantul din text','Ghidul și meniul de plăți automate se adaptează la telefon (iPhone sau Android)'],en:['Android: automatic payments from notifications or SMS, with MacroDroid; the app reads the amount and merchant from the text','The automatic payments guide and menu adapt to the phone (iPhone or Android)']},
 {v:'2.5.3',d:'2026-10-14',ro:['În Buget: ții apăsat pe o categorie și o tragi sus sau jos ca să schimbi ordinea; meniul de ordine a dispărut'],en:['In Budget: press and hold a category and drag it up or down to reorder; the order menu is gone']},
 {v:'2.5.2',d:'2026-10-13',ro:['Reminderele din calendar se deschid direct în Safari, unde iPhone-ul le adaugă în Calendar cu un singur tap'],en:['Calendar reminders open directly in Safari, where iPhone adds them to Calendar with one tap']},
 {v:'2.5.1',d:'2026-10-13',ro:['Reparat: „Arată toate” și „Restrânge” la De plătit','Ghidul Apple Pay explică cum alegi corect „URL Encoded Text” pentru sumă și comerciant'],en:['Fixed: “Show all” and “Collapse” in Upcoming','The Apple Pay guide explains how to pick the right “URL Encoded Text” for amount and merchant']},
 {v:'2.5',d:'2026-10-13',ro:['Setări → Personalizare: mărimea textului, densitatea listelor și cardurile de pe prima pagină (ordine și vizibilitate)','Ordinea categoriilor se schimbă din Buget sau din Personalizare și se păstrează la alegerea categoriei','Fiecare categorie are culoare aleasă de tine și mai multe emoji','Fundal de pornire mai animat'],en:['Settings → Customization: text size, list density and home page cards (order and visibility)','Category order can be changed from Budget or Customization and is kept when picking a category','Each category can have its own color and more emoji','Livelier launch background']},
 {v:'2.4',d:'2026-10-13',ro:['Buton ✕ la plățile Apple Pay de verificat, ca să le lași așa cum sunt (se poate anula)','Animație de fundal pe ecranul de pornire, cât timp se încarcă aplicația'],en:['✕ button on Apple Pay payments to review, to keep them as they are (can be undone)','Background animation on the launch screen while the app loads']},
 {v:'2.3',d:'2026-10-13',ro:['Cardul „Azi” în modul Bani comuni arată suma rămasă pentru amândoi și cât revine fiecăruia, ca să nu pară că fiecare poate cheltui suma întreagă','Calculul de azi ține cont de toate plățile din bugetul comun, nu doar de cele afișate cu filtrul curent'],en:['In Shared money mode the “Today” card shows what is left for both of you and each person’s part, so it no longer looks like each can spend the full amount','Today’s calculation counts every payment in the shared budget, not only those shown by the current filter']},
 {v:'2.2.2',d:'2026-10-13',ro:['În Istoric: glisezi spre dreapta ca să modifici și spre stânga ca să ștergi','Schimbarea tab-urilor prin glisare pe ecran a fost oprită; folosești bara de jos'],en:['In History: swipe right to edit and left to delete','Switching tabs by swiping the screen is turned off; use the bottom bar']},
 {v:'2.2',d:'2026-10-13',ro:['Anulează: după salvare, ștergere, import sau plată ai câteva secunde să revii','Cardul „Azi” pe prima pagină: cât ai cheltuit și cât mai poți cheltui azi','Glisează un rând din Istoric spre stânga ca să-l modifici sau să-l ștergi','Backup ca fișier, pe care îl salvezi din telefon și îl poți alege la restaurare'],en:['Undo: after saving, deleting, importing or paying you have a few seconds to go back','“Today” card on the home page: what you spent and what you can still spend today','Swipe a History row left to edit or delete it','Backup as a file you can save from your phone and pick when restoring']},
 {v:'2.1',d:'2026-10-13',ro:['Comerciant necunoscut: alegi dacă memorezi regula sau modifici doar plata curentă','Apple Pay și reguli într-un ecran compact: ghidul și regulile se deschid doar când ai nevoie, iar regulile se pot edita','Ghid Apple Pay actualizat pentru iOS 26 și 27; aplicația corectează singură suma și comerciantul dacă sunt inversate în link','Import CSV fără dubluri chiar dacă încarci același extras de mai multe ori, inclusiv pentru venituri'],en:['Unknown merchant: choose whether to remember a rule or change only the current payment','Apple Pay and rules in one compact screen: the guide and rules open only when needed, and rules are editable','Apple Pay guide updated for iOS 26 and 27; the app fixes swapped amount and merchant in the link','CSV import without duplicates even if you load the same statement several times, including income']},
 {v:'2.0',d:'2026-10-13',ro:['Bară de jos în stil Liquid Glass: o tragi cu degetul și pagina o urmează, cu efect de sticlă','Setări compacte, grupate pe categorii, cu teme de culoare și aspect luminos sau întunecat','Vacanța și sezoanele sunt acum în tabul Buget','Sumele se numără animat, barele se umplu lin, confetti la un obiectiv atins și stare a bugetului pe cardul de sold'],en:['Liquid Glass style bottom bar: drag it with your finger and the page follows, with a glass effect','Compact settings grouped by category, with color themes and light or dark look','Vacation and seasons now live in the Budget tab','Animated number count-up, smooth progress bars, confetti when a goal is reached and a budget status on the balance card']},
 {v:'1.9',d:'2026-10-13',ro:['Raport automat de erori: dacă apare un bug, aplicația îl salvează și îl trimite în baza de date, ca să poată fi reparat','Ecran „Raport erori” în Setări, cu copiere și trimitere manuală','Rapoartele nu conțin sume, note sau nume'],en:['Automatic error report: if a bug appears, the app saves it and sends it to the database so it can be fixed','“Error report” screen in Settings with copy and manual send','Reports contain no amounts, notes or names']},
 {v:'1.8',d:'2026-10-13',ro:['Mod vacanță și teme de sezon (Crăciun, Black Friday, începutul școlii): dată de început și sfârșit, buget propriu și închidere automată','Cheltuielile din perioadă se etichetează singure (și la Apple Pay sau CSV) și nu mai strică bugetele lunare','Card pe prima pagină cu cât mai poți cheltui pe zi'],en:['Vacation mode and seasonal themes (Christmas, Black Friday, back to school): start and end dates, own budget and automatic closing','Expenses in the period are tagged automatically (also from Apple Pay and CSV) and no longer break monthly budgets','Home card showing how much you can spend per day']},
 {v:'1.7',d:'2026-10-12',ro:['Reminder în calendar pentru plățile viitoare și abonamente, cu notificare în ziua plății sau cu zile înainte','Alegi ora notificării și ce plăți adaugi','Abonamentele se repetă lunar în Calendar'],en:['Calendar reminders for upcoming payments and subscriptions, alerting on the day or days before','Pick the alert time and which payments to add','Subscriptions repeat monthly in Calendar']},
 {v:'1.6',d:'2026-10-12',ro:['Import din extras de cont (CSV) cu recunoașterea automată a coloanelor și a comercianților','Jurnal de activitate: cine a adăugat sau modificat ce, și când','Tranzacțiile importate învață din corecții, ca plățile Apple Pay'],en:['Import from a bank statement (CSV) with automatic column and merchant detection','Activity log: who added or changed what, and when','Imported transactions learn from corrections, like Apple Pay payments']},
 {v:'1.5',d:'2026-10-11',ro:['Mod confidențial: ascunzi sumele cu ochiul din colțul de sus','PIN opțional la deschiderea aplicației','Jurnal cu ultimele actualizări (această pagină)'],en:['Privacy mode: hide amounts with the eye at the top','Optional PIN when opening the app','Update log (this page)']},
 {v:'1.4',d:'2026-10-10',ro:['Obiective de economisire: alegi suma și numărul de luni, iar aplicația calculează cât aloci lunar','Regula 50/20/30 în Buget și sfatul lunii','Animație de pornire cu grafic care crește'],en:['Savings goals: pick an amount and months, and the app calculates the monthly amount','50/20/30 rule in Budget and a tip of the month','Startup animation with a growing chart']},
 {v:'1.3',d:'2026-10-10',ro:['Plăți Apple Pay adăugate automat, cu reguli care învață din corecții','Link rapid cu parametri pentru Comenzi rapide (iOS 17–27)','Ghid și buton de plată de test'],en:['Apple Pay payments added automatically, with rules that learn from corrections','Quick link with parameters for Shortcuts (iOS 17–27)','Guide and a test payment button']},
 {v:'1.2',d:'2026-10-09',ro:['Tab Buget: venituri, categorii proprii și sume alocate','Bani comuni sau împărțiți, cu împărțire 50/50 sau după venituri','Butonul + diferit pe fiecare pagină'],en:['Budget tab: income, custom categories and allocations','Shared or split money, with a 50/50 or income-based split','The + button differs on each page']},
 {v:'1.1',d:'2026-10-09',ro:['Cont și partener: sincronizare în timp real','Filtre Eu / Partener / Comun și decontare','Îmbunătățiri pentru ecrane mici și modul întunecat'],en:['Account and partner: real-time sync','Me / Partner / Shared filters and settlement','Improvements for small screens and dark mode']},
 {v:'1.0',d:'2026-10-08',ro:['Cheltuieli, venituri, plăți de făcut și abonamente','Grafic pe categorii și istoric','Limbă, monedă și backup'],en:['Expenses, income, upcoming payments and subscriptions','Category chart and history','Language, currency and backup']}
];
function whatsNewCard(){
 if(S.seenVer===APP_VER)return '';
 return `<div class="card tipc"><button class="tipx" data-act="logx" aria-label="OK">✕</button><h3>🆕 ${t('logNew').replace('{v}',APP_VER)}</h3><p class="note">${esc(CHANGELOG[0][S.lang][0])}</p><button class="plt" data-act="logopen">${t('logSee')}</button></div>`;
}
function saveLocal(){try{localStorage.setItem(KEY2,JSON.stringify(S))}catch(e){}}
function openLog(){
 S.seenVer=APP_VER;saveLocal();
 $('#log-body').innerHTML=CHANGELOG.map(c=>`<div class="lgv"><b>${t('logT')==='Ce e nou'?'Versiunea':'Version'} ${c.v}</b><span>${fd(c.d)}</span></div><ul class="lgl">${c[S.lang].map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`).join('');
 $('#log').hidden=false;render();
}
function closeLog(){$('#log').hidden=true}
/* --- PIN --- */
const KEYP='cheltuieli_pin';
let pinH=null,lockMode='unlock',pinBuf='',pinTmp='',pinFail=0,pinUntil=0,hiddenAt=0,lkArm=false;
const canPin=()=>!!(window.crypto&&crypto.subtle&&window.TextEncoder);
function pinLoad(){try{pinH=JSON.parse(localStorage.getItem(KEYP)||'null')}catch(e){pinH=null}}
async function hashPin(p,salt){const d=new TextEncoder().encode(salt+':'+p),h=await crypto.subtle.digest('SHA-256',d);return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function lockShow(mode){lockMode=mode;pinBuf='';pinTmp='';lkArm=false;$('#lock').hidden=false;lkRender()}
function lkRender(msg){
 const ti={unlock:'lkEnter',off:'lkOld',old:'lkOld',set1:'lkNew',set2:'lkRep'}[lockMode];
 $('#lk-title').textContent=t(ti);$('#lk-msg').textContent=msg||'';
 document.querySelectorAll('#lk-dots i').forEach((d,i)=>d.classList.toggle('on',i<pinBuf.length));
 const f=$('#lk-forgot'),c=$('#lk-cancel');
 f.hidden=lockMode!=='unlock';f.textContent=lkArm?t('lkSure'):t('lkForgot');
 c.hidden=lockMode==='unlock';c.textContent=t('lkCancel');
}
function lkBad(msg){
 pinBuf='';lkRender(msg);
 const d=$('#lk-dots');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');
}
function lkKey(k){
 if(k==='b')pinBuf=pinBuf.slice(0,-1);
 else if(pinBuf.length<4)pinBuf+=k;
 lkRender();
 if(pinBuf.length===4)setTimeout(lkDone,120);
}
async function lkDone(){
 const p=pinBuf;if(p.length!==4)return;
 try{
  if(lockMode==='set1'){pinTmp=p;pinBuf='';lockMode='set2';lkRender();return}
  if(lockMode==='set2'){
   if(p!==pinTmp){lockMode='set1';pinTmp='';lkBad(t('lkMis'));return}
   const salt=Math.random().toString(36).slice(2,10);
   pinH={s:salt,h:await hashPin(p,salt)};
   try{localStorage.setItem(KEYP,JSON.stringify(pinH))}catch(e){}
   $('#lock').hidden=true;prvRender();return;
  }
  if(Date.now()<pinUntil){lkBad(t('lkWait').replace('{s}',Math.ceil((pinUntil-Date.now())/1000)));return}
  const ok=pinH&&(await hashPin(p,pinH.s))===pinH.h;
  if(!ok){pinFail++;if(pinFail>=5){pinUntil=Date.now()+30000;pinFail=0}lkBad(t('lkBad'));return}
  pinFail=0;
  if(lockMode==='unlock')$('#lock').hidden=true;
  else if(lockMode==='off'){pinH=null;try{localStorage.removeItem(KEYP)}catch(e){}$('#lock').hidden=true;prvRender()}
  else if(lockMode==='old'){lockMode='set1';pinBuf='';lkRender()}
 }catch(e){console.error(e);lkBad('Eroare')}
}
function lkForgot(){
 if(!lkArm){lkArm=true;lkRender();return}
 try{localStorage.removeItem(KEYP);localStorage.removeItem(KEY)}catch(e){}
 location.reload();
}
function prvRender(){
 const el=$('#prv-body');if(!el||$('#prv').hidden)return;
 let h=`<p class="hint">${t('prvHideH')}</p><div class="seg"><button data-act="privset" data-v="0" class="${S.priv?'':'on'}">${t('privOff')}</button><button data-act="privset" data-v="1" class="${S.priv?'on':''}">${t('privOn')}</button></div>`;
 h+=`<button class="menu" data-act="privstart"><span>${t('prvStart')}</span><span>${S.privStart?'✓':'○'}</span></button>`;
 h+=`<h3 style="margin:16px 0 4px;font-size:16px">${t('prvPin')}</h3><p class="hint">${pinH?t('prvPinOn'):t('prvPinOff')}</p>`;
 if(!canPin())h+=`<p class="hint">${t('prvNoCrypto')}</p>`;
 else if(pinH)h+=`<div class="btns"><button data-act="pinchange">${t('prvChPin')}</button><button data-act="pinoff">${t('prvRmPin')}</button></div>`;
 else h+=`<div class="btns"><button class="pri" data-act="pinset">${t('prvSetPin')}</button></div>`;
 h+=`<p class="hint">${t('prvNote')}</p>`;
 el.innerHTML=h;
}
function openPrv(){$('#prv').hidden=false;prvRender()}
function closePrv(){$('#prv').hidden=true}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){hiddenAt=Date.now();return}
 if(pinH&&$('#lock').hidden&&Date.now()-hiddenAt>30000)lockShow('unlock');
});
document.addEventListener('keydown',e=>{
 if($('#lock').hidden)return;
 if(/^\d$/.test(e.key))lkKey(e.key);else if(e.key==='Backspace')lkKey('b');
});

/* ===== Economii, regula 50/20/30, sfatul lunii ===== */
const mi=ym=>+ym.slice(0,4)*12+(+ym.slice(5,7)-1);
const ymAdd=(ym,n)=>{const i=mi(ym)+n;return Math.floor(i/12)+'-'+p2(i%12+1)};
const goalEnd=g=>ymAdd(g.start,g.months-1);
const monthLbl=ym=>new Date(+ym.slice(0,4),+ym.slice(5,7)-1,1).toLocaleDateString(loc(),{month:'short',year:'numeric'});
const savedBefore=(g,ym)=>g.saved0+tx.reduce((a,x)=>a+(x.sv===g.id&&x.date.slice(0,7)<ym?x.amt:0),0);
const savedTotal=g=>g.saved0+tx.reduce((a,x)=>a+(x.sv===g.id?x.amt:0),0);
const depMonth=(g,ym)=>tx.reduce((a,x)=>a+(x.sv===g.id&&x.date.startsWith(ym)?x.amt:0),0);
function goalPlan(g,ym){
 const sb=savedBefore(g,ym),left=Math.max(0,g.target-sb),end=goalEnd(g),from=ym<g.start?g.start:ym;
 const n=Math.max(1,mi(end)-mi(from)+1);
 return {sb,left,n,plan:left/n,end};
}
const goalActive=(g,ym)=>ym>=g.start&&savedBefore(g,ym)<g.target;
const savAlloc=ym=>goals.reduce((a,g)=>a+(goalActive(g,ym)?goalPlan(g,ym).plan:0),0);
const numIn=v=>{const q=String(v||'').trim().replace(',','.');return /^\d+(\.\d{1,2})?$/.test(q)?parseFloat(q):NaN};
function goalsCard(ym){
 let h=`<div class="card bcard"><h3><span>🎯 ${t('gTitle')}</span><b>${fmt(savAlloc(ym))}</b></h3>`;
 if(!goals.length)h+=`<p class="hint">${t('gNone')}</p>`;
 goals.forEach(g=>{
  const p=goalPlan(g,ym),saved=savedTotal(g),pct=g.target>0?Math.min(100,saved/g.target*100):0,dm=depMonth(g,ym),done=saved>=g.target;
  h+=`<div class="goalw"><button class="brow" data-act="editgoal" data-id="${g.id}"><i class="ic" style="background:#0f766e2e">${esc(g.emoji||'🎯')}</i><span class="bm"><span class="bl2"><b>${esc(g.name)}</b><span>${nf(saved)} / ${fmt(g.target)}</span></span><span class="tr"><i style="width:${pct}%;background:${done?'var(--g)':'var(--accent)'}"></i></span><small>${done?t('gDone'):t('gPlan')+' '+fmt(p.plan)+' · '+t('gMonthsLeft').replace('{n}',p.n)+' · '+t('gDeadline')+' '+monthLbl(p.end)}</small>${done?'':`<small>${t('gThisMonth')}: ${fmt(dm)} / ${fmt(p.plan)}</small>`}</span></button>${done?'':`<button class="plt" data-act="deposit" data-id="${g.id}">+ ${t('gDeposit')}</button>`}</div>`;
 });
 return h+`<button class="plt" data-act="addgoal">+ ${t('gAdd')}</button></div>`;
}
const EMOG=['🏖️','🚗','🏠','💻','📱','🎓','💍','👶','✈️','🛡️','🎁','🏦'];
let goalId=null,depId=null,catGrp='w';
function openGoal(id){
 goalId=id;armed='';
 const g=id?goals.find(k=>k.id===id):null;
 $('#goal-title').textContent=t(g?'gEdit':'gNew');
 $('#g-name').value=g?g.name:'';$('#g-emo').value=g?(g.emoji||''):'';
 const f=n=>n?String(n).replace('.',S.lang==='en'?'.':','):'';
 $('#g-target').value=g?f(g.target):'';$('#g-saved').value=g?f(g.saved0):'';$('#g-months').value=g?g.months:12;
 $('#g-emos').innerHTML=EMOG.map(e=>`<button data-gemo="${e}">${e}</button>`).join('');
 const d=$('#g-del');d.hidden=!g;d.textContent=t('gDel');d.classList.remove('dng');
 $('#goal-err').textContent='';goalPrev();$('#goal').hidden=false;
}
function closeGoal(){$('#goal').hidden=true;goalId=null;armed=''}
function goalPrev(){
 const el=$('#g-prev');if(!el)return;
 const tg=numIn($('#g-target').value),sv=$('#g-saved').value.trim()?numIn($('#g-saved').value):0,mo=parseInt($('#g-months').value,10);
 if(!(tg>0)||!(mo>=1)||isNaN(sv)){el.textContent='';return}
 const g=goalId?goals.find(k=>k.id===goalId):null,start=g?g.start:mk(view),dep=g?tx.reduce((a,x)=>a+(x.sv===g.id?x.amt:0),0):0;
 const left=Math.max(0,tg-sv-dep);
 if(left<=0){el.textContent=t('gPrevDone');return}
 const endYm=ymAdd(start,mo-1),cur=mk(new Date()),from=cur>start?cur:start,n=Math.max(1,mi(endYm)-mi(from)+1);
 el.textContent=t('gPrev').replace('{a}',fmtR(left/n)).replace('{n}',n).replace('{d}',monthLbl(endYm));
}
function saveGoal(){
 const name=$('#g-name').value.trim().slice(0,30),emo=($('#g-emo').value.trim()||'🎯').slice(0,4);
 const tg=numIn($('#g-target').value),sv=$('#g-saved').value.trim()?numIn($('#g-saved').value):0,mo=parseInt($('#g-months').value,10);
 if(!name||!(tg>0)||isNaN(sv)||!(mo>=1&&mo<=600))return $('#goal-err').textContent=t('gBad');
 const g=goalId?goals.find(k=>k.id===goalId):null;
 if(g)Object.assign(g,{name,emoji:emo,target:tg,saved0:sv,months:mo});
 else goals.push({id:Date.now(),name,emoji:emo,target:tg,saved0:sv,months:mo,start:mk(view)});
 save();closeGoal();render();
}
function delGoal(){
 const b=$('#g-del');
 if(armed!=='gdel'){armed='gdel';b.textContent=t('sure');b.classList.add('dng');return}
 goals=goals.filter(k=>k.id!==goalId);save();closeGoal();render();
}
function openDep(id){
 const g=goals.find(k=>k.id===id);if(!g)return;
 depId=id;const ym=mk(new Date()),rest=Math.max(0,goalPlan(g,ym).plan-depMonth(g,ym));
 $('#dep-title').textContent=t('gDepTitle').replace('{g}',g.name);
 $('#d-amt').value=rest>0?String(Math.round(rest*100)/100).replace('.',S.lang==='en'?'.':','):'';
 $('#d-date').value=today();$('#dep-err').textContent='';$('#dep').hidden=false;
}
function closeDep(){$('#dep').hidden=true;depId=null}
function saveDep(){
 const g=goals.find(k=>k.id===depId);if(!g)return;
 const amt=numIn($('#d-amt').value),d=$('#d-date').value||today();
 if(!(amt>0))return $('#dep-err').textContent=t('eamt');
 const x={id:Date.now(),type:'exp',amt,cat:'Economii',date:d,note:g.name,sv:g.id};
 if(C.hid){x.own=C.mode==='common'?'shared':C.uid;if(x.own==='shared')x.by=C.uid}
 const was=g.saved0+tx.reduce((a,r)=>a+(r.sv===g.id?r.amt:0),0);
 tx.push(x);logAdd('dep','goal',{g:g.name,m:amt});save();closeDep();render();
 if(was<g.target&&was+amt>=g.target)setTimeout(confetti,350);
}
const NEEDS=['Mâncare','Facturi','Casă','Sănătate','Combustibil','Transport'];
const grpOf=c=>c.grp||(NEEDS.includes(c.name)?'n':'w');
function syncGrp(){document.querySelectorAll('[data-grp]').forEach(b=>b.classList.toggle('on',b.dataset.grp===catGrp))}
function rule532(ym){
 const known=new Set(cats.map(c=>c.name));let n=0,w=0,sv=0;
 cats.forEach(c=>{const v=spentIn(c.name,ym);if(grpOf(c)==='n')n+=v;else w+=v});
 tx.forEach(x=>{if(x.type!=='exp'||!x.date.startsWith(ym))return;if(x.sv)sv+=share(x,ym);else if(!known.has(x.cat))w+=share(x,ym)});
 return {n,w,sv};
}
function ruleCard(ym,inc){
 let h=`<div class="card bcard"><h3><span>📐 ${t('r532T')}</span></h3>`;
 if(!(inc>0))return h+`<p class="hint">${t('r532NoInc')}</p></div>`;
 const a=rule532(ym),rows=[['🏠',t('r532Need'),inc*.5,a.n,'cap'],['🏦',t('r532Sav'),inc*.2,a.sv,'goal'],['🎈',t('r532Want'),inc*.3,a.w,'cap']];
 rows.forEach(([e,l,tg,v,k])=>{
  const over=k==='cap'&&v>tg,ok=k==='goal'&&v>=tg,pct=tg>0?Math.min(100,v/tg*100):0;
  const col=over?'var(--r)':ok?'var(--g)':(k==='cap'&&v>=tg*.8?'#d97706':'var(--accent)');
  h+=`<div class="ovr"><div class="bl2"><span>${e} ${l}</span><span>${nf(v)} / ${fmt(tg)}</span></div><div class="tr"><i style="width:${pct}%;background:${col}"></i></div></div>`;
 });
 return h+'</div>';
}
const TIPS={ro:['Plătește-te primul: mută banii pentru economii imediat ce intră salariul.','Notează fiecare cheltuială în aceeași zi; sumele mici se adună.','Verifică abonamentele: anulează ce nu ai folosit luna trecută.','Planifică mesele săptămânii înainte să mergi la cumpărături.','Construiește un fond de urgență de 3–6 luni de cheltuieli.','Așteaptă 48 de ore înainte de o cumpărătură neplanificată.','Pune o sumă mică pentru dorințe, ca să nu te simți vinovat când le cumperi.','Compară prețurile la facturi (internet, energie) o dată pe an.','Redu întâi cheltuielile mari, nu cafeaua: de acolo vine economia reală.','Setează o sumă fixă lunară pentru fiecare obiectiv de economisire.','Revizuiește bugetul la mijlocul lunii și ajustează categoriile depășite.','La final de an, adună ce ai economisit și stabilește obiectivele pentru anul următor.'],
 en:['Pay yourself first: move savings the moment your salary arrives.','Log every expense the same day; small amounts add up.','Review subscriptions: cancel what you did not use last month.','Plan the week’s meals before you go shopping.','Build an emergency fund of 3–6 months of expenses.','Wait 48 hours before an unplanned purchase.','Set a small amount for wants, so you do not feel guilty buying them.','Compare bill prices (internet, energy) once a year.','Cut big expenses first, not the coffee: that is where real savings come from.','Set a fixed monthly amount for each savings goal.','Review your budget mid-month and adjust the categories you overspent.','At year end, add up what you saved and set goals for next year.']};
function tipCard(){
 const cur=mk(new Date());
 if(mk(view)!==cur||S.tipDone===cur)return '';
 const inc=incomeIn(cur),body=inc>0?t('tipRule').replace('{i}',fmt(inc)).replace('{a}',fmt(inc*.5)).replace('{b}',fmt(inc*.2)).replace('{c}',fmt(inc*.3)):t('r532NoInc');
 return `<div class="card tipc"><button class="tipx" data-act="tipx" aria-label="OK">✕</button><h3>💡 ${t('tipT')}</h3><p class="note">${body}</p><p class="note"><i>${TIPS[S.lang][new Date().getMonth()]}</i></p><button class="plt" data-act="gobud">${t('tipOpen')}</button></div>`;
}
document.addEventListener('input',e=>{if(e.target.id==='g-target'||e.target.id==='g-saved'||e.target.id==='g-months')goalPrev()});

/* ===== Buget și categorii proprii ===== */
const defCats=()=>CATS.exp.map((n,i)=>({id:i+1,name:n,emoji:EM[n]||'✨',b:{},ord:i}));
const wal=()=>(!C.hid||C.mode==='common')?'shared':C.uid;
function myRatio(ym){
 if(C.ratio!=='income')return .5;
 let a=0,b=0;
 tx.forEach(x=>{if(x.type!=='inc'||!x.date.startsWith(ym))return;if(x.own===C.uid)a+=x.amt;else if(C.partner&&x.own===C.partner)b+=x.amt});
 return a+b>0?a/(a+b):.5;
}
const share=(x,ym)=>{if(!C.hid||C.mode==='common')return x.amt;if(x.own==='shared')return x.amt*myRatio(ym);return(!x.own||x.own===C.uid)?x.amt:0};
function bud(c,ym,w){const ks=Object.keys(c.b||{}).filter(k=>k<=ym&&c.b[k]&&c.b[k][w]!==undefined).sort();return ks.length?(+c.b[ks[ks.length-1]][w]||0):0}
const incomeIn=ym=>{let s=0;tx.forEach(x=>{if(x.type==='inc'&&x.date.startsWith(ym))s+=share(x,ym)});return s};
const spentIn=(n,ym)=>{let s=0;tx.forEach(x=>{if(x.type==='exp'&&!x.pk&&x.cat===n&&x.date.startsWith(ym))s+=share(x,ym)});return s};
const nf=n=>S.priv?'••••':n.toLocaleString(loc(),{maximumFractionDigits:2});
const stCol=(s,b)=>b>0?(s>b?'var(--r)':s>=b*.8?'#d97706':null):(s>0?'var(--r)':null);
(function(){
 let tm=0,st=null,px=0,py=0;
 const rowsOf=()=>[...document.querySelectorAll('#p-bud .brow[data-act=editcat]')];
 const cancel=()=>{clearTimeout(tm);tm=0};
 function start(row,y){
  const rows=rowsOf(),i=rows.indexOf(row);if(i<0||rows.length<2)return;
  const rc=rows.map(r=>{const b=r.getBoundingClientRect();return {t:b.top+scrollY,h:b.height}});
  const gap=rc.length>1?Math.max(0,rc[1].t-(rc[0].t+rc[0].h)):6;
  st={rows,i,j:i,rc,y0:y,sy0:scrollY,gap,last:y};
  rows.forEach(r=>{if(r!==row)r.style.transition='transform .18s ease'});
  row.classList.add('mv');
  try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}
  swBlock=Date.now()+1e7;
  loop();
 }
 function place(){
  if(!st)return;
  const {rows,i,rc,gap}=st,dy=st.last+(scrollY-st.sy0)-st.y0,me=rc[i],cy=me.t+me.h/2+dy;
  const j=rows.filter((_,k)=>k!==i&&rc[k].t+rc[k].h/2<cy).length;st.j=j;
  rows.forEach((r,k)=>{
   if(k===i){r.style.transform=`translateY(${dy}px) scale(1.02)`;return}
   let sh=0;if(i<j&&k>i&&k<=j)sh=-(me.h+gap);else if(j<i&&k>=j&&k<i)sh=me.h+gap;
   r.style.transform=sh?`translateY(${sh}px)`:'';
  });
 }
 function loop(){
  if(!st)return;
  if(st.last<110)scrollBy(0,-9);else if(st.last>innerHeight-170)scrollBy(0,9);
  place();requestAnimationFrame(loop);
 }
 function end(){
  if(!st)return;
  const o=st;st=null;
  o.rows.forEach(r=>{r.style.transform='';r.style.transition='';r.classList.remove('mv')});
  swBlock=Date.now()+350;
  if(o.j!==o.i){const [c]=cats.splice(o.i,1);cats.splice(o.j,0,c);cats.forEach((k,n)=>{k.ord=n});save();render()}
 }
 document.addEventListener('touchstart',e=>{
  cancel();
  const row=e.target.closest&&e.target.closest('#p-bud .brow[data-act=editcat]');
  if(!row||e.touches.length!==1)return;
  px=e.touches[0].clientX;py=e.touches[0].clientY;
  tm=setTimeout(()=>{tm=0;start(row,py)},380);
 },{passive:true});
 document.addEventListener('touchmove',e=>{
  const y=e.touches[0].clientY;
  if(st){e.preventDefault();st.last=y;return}
  if(tm&&(Math.abs(e.touches[0].clientX-px)>8||Math.abs(y-py)>8))cancel();
 },{passive:false});
 document.addEventListener('touchend',()=>{cancel();end()});
 document.addEventListener('touchcancel',()=>{cancel();end()});
})();
function budgetPane(){
 const ym=mk(view),w=wal(),inc=incomeIn(ym);
 const rows=cats.map(c=>({c,b:bud(c,ym,w),s:spentIn(c.name,ym)}));
 const alloc=rows.reduce((a,r)=>a+r.b,0),sa=savAlloc(ym),free=inc-alloc-sa;
 const known=new Set(cats.map(c=>c.name));
 let other=0;tx.forEach(x=>{if(x.type==='exp'&&!x.pk&&!x.sv&&!known.has(x.cat)&&x.date.startsWith(ym))other+=share(x,ym)});
 let h='';
 if(C.hid)h+=`<button class="modeb" data-act="accopen"><span>${C.mode==='common'?'💞 '+t('mCommon'):'👥 '+t('mSplit')}</span><span>›</span></button>`;
 const ins=tx.filter(x=>x.type==='inc'&&x.date.startsWith(ym)&&share(x,ym)>0).sort((a,b)=>b.date.localeCompare(a.date));
 h+=`<div class="card bcard"><h3><span>💰 ${t('bInc')}</span><b class="g">${fmt(inc)}</b></h3>`;
 if(!ins.length)h+=`<p class="hint">${t('bNone')}</p>`;
 ins.forEach(x=>{h+=`<button class="row" data-act="edit" data-id="${x.id}">${ic(x)}<span class="rt"><b>${esc(cn(x.cat))}</b><small>${fd(x.date)}${(x.own==='shared'&&C.hid&&C.mode!=='common')?' · '+t('sShared'):''}${x.note?' · '+esc(x.note):''}</small></span><em class="g">+${fmt(share(x,ym))}</em></button>`});
 h+=`<button class="plt" data-act="addinc">+ ${t('addInc')}</button></div>`;
 h+=ruleCard(ym,inc);
 h+=`<div class="card bcard"><h3><span>🧮 ${t('bAlloc')}</span><b>${fmt(alloc)}</b></h3><p class="hint" style="margin:-2px 0 8px">${t('cusHold')}</p>`;
 h+=`<p class="note${free<0?' over':''}">${free<0?t('bOver'):t('bFree')}: <b>${fmt(Math.abs(free))}</b></p>`;
 if(sa>0)h+=`<p class="note">🏦 ${t('gAlloc')}: <b>${fmt(sa)}</b></p>`;
 const sp=rows.reduce((a,r)=>a+r.s,0);
 if(alloc>0)h+=`<div class="ovr"><div class="bl2"><span>${t('bSpent')}</span><span>${nf(sp)} / ${fmt(alloc)}</span></div><div class="tr"><i style="width:${Math.min(100,sp/alloc*100)}%;background:${stCol(sp,alloc)||'var(--accent)'}"></i></div></div>`;
 rows.forEach(({c,b,s})=>{
  const over=b>0?s>b:s>0,pct=b>0?Math.min(100,s/b*100):(s>0?100:0);
  h+=`<button class="brow" data-act="editcat" data-id="${c.id}"><i class="ic" style="background:${cc(c.name)}2e">${esc(c.emoji||'✨')}</i><span class="bm"><span class="bl2"><b>${esc(cn(c.name))}</b><span>${nf(s)} / ${fmt(b)}</span></span><span class="tr"><i style="width:${pct}%;background:${stCol(s,b)||cc(c.name)}"></i></span><small class="${over?'late':''}">${(b>0||s>0)?(over?t('cOver')+' '+fmt(s-b):t('cLeft')+' '+fmt(b-s)):t('cNoBud')}</small></span></button>`;
 });
 if(other>0)h+=`<div class="brow"><i class="ic" style="background:#64748b2e">📦</i><span class="bm"><span class="bl2"><b>${t('cOther')}</b><span>${fmt(other)}</span></span></span></div>`;
 h+=`<button class="plt" data-act="addcat">+ ${t('cAdd')}</button></div>`;
 {let ps=0;tx.forEach(x=>{if(x.type==='exp'&&x.pk&&x.date.startsWith(ym))ps+=share(x,ym)});if(ps>0)h+=`<p class="hint">🧳 ${t('perOut')}: <b>${fmt(ps)}</b></p>`}

 h+=perBudCard();
 h+=goalsCard(ym);
 return h;
}
let catId=null,catCol='';
const CPAL=['#0f766e','#0284c7','#2563eb','#7c3aed','#c026d3','#db2777','#dc2626','#ea580c','#d97706','#ca8a04','#65a30d','#16a34a','#0891b2','#64748b','#78350f','#111827'];
function colRender(){
 const el=$('#c-cols');if(!el)return;
 el.innerHTML=`<button data-act="ccol" data-v="" class="${catCol?'':'on'}" style="background:conic-gradient(#0f766e,#0284c7,#7c3aed,#db2777,#ea580c,#65a30d,#0f766e)" aria-label="Auto"></button>`+CPAL.map(c=>`<button data-act="ccol" data-v="${c}" class="${catCol===c?'on':''}" style="background:${c}" aria-label="${c}"></button>`).join('')+`<label aria-label="${t('cColC')}"><input type="color" id="c-colc" value="${catCol||'#0f766e'}"></label>`;
}
document.addEventListener('input',e=>{if(e.target.id==='c-colc'){catCol=e.target.value;el2=$('#c-cols');if(el2)el2.querySelectorAll('button').forEach(b=>b.classList.remove('on'))}});
let el2=null;
const CARDF={today:()=>todayCard(),tip:()=>tipCard(),per:()=>perCard(),plan:()=>planCard(),ap:()=>apCard(),alert:()=>budAlert(),settle:()=>settleCard(mk(view)),chart:(m,i,e)=>charts(m,i,e)};
const CARDN={today:['📅','cdToday'],tip:['💡','tipT'],per:['🧳','perT'],plan:['🗓️','pl'],ap:['🍎','apChkCard'],alert:['⚠️','cdAlert'],settle:['🤝','setT'],chart:['📊','cdChart']};
function cardOrd(){const o=(S.cards||[]).filter(k=>CARDK.includes(k));CARDK.forEach(k=>{if(!o.includes(k))o.push(k)});return o}
function homeCards(m,inc,exp){const hd=new Set(S.hide||[]);return cardOrd().filter(k=>!hd.has(k)).map(k=>{try{return CARDF[k](m,inc,exp)||''}catch(e){return ''}}).join('')}
function openCus(sec){$('#cus').hidden=false;renderCus();if(sec==='cats')setTimeout(()=>{const x=$('#cus-cats');if(x)x.scrollIntoView({block:'start'})},60)}
function closeCus(){$('#cus').hidden=true}
function renderCus(){
 const el=$('#cus-body');if(!el||$('#cus').hidden)return;
 const fs=S.fs||'m',den=S.den||'n',hd=new Set(S.hide||[]),o=cardOrd();
 let h=`<div class="cusg">${t('cusFs')}</div><div class="seg4">`+[['s',14],['m',17],['l',20],['x',23]].map(([k,z])=>`<button data-act="fs" data-v="${k}" class="${fs===k?'on':''}" style="font-size:${z}px;font-weight:700">A</button>`).join('')+'</div>';
 h+=`<div class="cusg">${t('cusDen')}</div><div class="seg3b">`+[['c','cusDc'],['n','cusDn'],['r','cusDr']].map(([k,l])=>`<button data-act="den" data-v="${k}" class="${den===k?'on':''}">${t(l)}</button>`).join('')+'</div>';
 h+=`<div class="cusg">${t('cusCards')}</div><p class="hint">${t('cusCardsH')}</p><div class="cusl">`;
 o.forEach((k,i)=>{const [em,lb]=CARDN[k],on=!hd.has(k);h+=`<div class="cusr${on?'':' off'}"><span class="nm"><span>${em}</span><span>${esc(t(lb))}</span></span><button data-act="cardmv" data-ck="${k}" data-d="-1" ${i===0?'disabled':''} aria-label="Sus">▲</button><button data-act="cardmv" data-ck="${k}" data-d="1" ${i===o.length-1?'disabled':''} aria-label="Jos">▼</button><button class="tg${on?' on':''}" data-act="cardtog" data-ck="${k}">${on?t('cusOn'):t('cusOff')}</button></div>`});
 h+=`</div><div class="btns"><button data-act="cardrst">${t('cusRst')}</button></div>`;
 el.innerHTML=h;
}
const EMOS=['🍽️','🛒','🚌','⛽','🚗','🏠','🧾','💡','💧','🔥','📶','💊','🏥','🏋️','🎮','🎬','🎵','📚','🛍️','👕','👟','💄','💇','🎁','📱','💻','🔄','✈️','🏖️','🐶','🐱','👶','🧸','🎓','🍺','🍷','☕','🍕','🍔','🥗','🚬','⚽','🎨','🔧','🧹','💸','🏦','💳','❤️','✨'];
function openCat(id){
 catId=id;armed='';
 const c=id?cats.find(k=>k.id===id):null,ym=mk(view),v=c?bud(c,ym,wal()):0;
 $('#cat-title').textContent=t(c?'cEdit':'cNew');
 $('#c-name').value=c?c.name:'';
 $('#c-emo').value=c?(c.emoji||''):'';
 $('#c-amt').value=v?String(v).replace('.',S.lang==='en'?'.':','):'';
 $('#c-bl').textContent=t('cBud')+' ('+S.cur+') · '+mt(view);
 $('#c-emos').innerHTML=EMOS.map(e=>`<button data-emo="${e}">${e}</button>`).join('');
 const d=$('#c-del');d.hidden=!c;d.textContent=t('cDel');d.classList.remove('dng');
 catGrp=c?grpOf(c):'w';syncGrp();
 catCol=c&&c.col||'';colRender();
 $('#cat-err').textContent='';$('#cat').hidden=false;
}
function closeCat(){$('#cat').hidden=true;catId=null;armed=''}
function saveCat(){
 const name=$('#c-name').value.trim().slice(0,24),emo=($('#c-emo').value.trim()||'✨').slice(0,4),raw=$('#c-amt').value.trim().replace(',','.');
 const e=m=>{$('#cat-err').textContent=m};
 if(!name)return e(t('cEmpty'));
 if(cats.some(k=>k.id!==catId&&k.name.toLowerCase()===name.toLowerCase()))return e(t('cDupe'));
 if(raw&&!/^\d+(\.\d{1,2})?$/.test(raw))return e(t('cBadAmt'));
 const amt=raw?parseFloat(raw):0,ym=mk(view),w=wal();
 let c=catId?cats.find(k=>k.id===catId):null;
 if(c){
  if(c.name!==name){const o=c.name;[tx,pl,subs].forEach(a=>a.forEach(x=>{if(x.cat===o)x.cat=name}));c.name=name}
  c.emoji=emo;
 }else{c={id:Date.now(),name,emoji:emo,b:{},ord:cats.length};cats.push(c)}
 c.grp=catGrp;if(catCol)c.col=catCol;else delete c.col;
 c.b=c.b||{};c.b[ym]=Object.assign({},c.b[ym],{[w]:amt});
 save();closeCat();render();renderCus();
}
function delCat(){
 const b=$('#c-del');
 if(armed!=='cdel'){armed='cdel';b.textContent=t('sure');b.classList.add('dng');return}
 cats=cats.filter(k=>k.id!==catId);save();closeCat();render();
}
function fabUpdate(){
 const f=$('.fab');if(!f)return;
 f.classList.toggle('hide',tab==='hist');
 f.tabIndex=tab==='hist'?-1:0;
 f.setAttribute('aria-label',t(tab==='bud'?'bAdd':'add'));
 if(tab!=='bud')closeFabm();
}
function toggleFabm(){const m=$('#fabm'),o=m.hidden;m.hidden=!o;$('#fabb').hidden=!o;$('.fab').classList.toggle('open',o)}
function closeFabm(){const m=$('#fabm');if(!m||m.hidden)return;m.hidden=true;$('#fabb').hidden=true;$('.fab').classList.remove('open')}
function budAlert(){
 const ym=mk(view),w=wal(),o=cats.filter(c=>{const b=bud(c,ym,w);return b>0&&spentIn(c.name,ym)>b});
 if(!o.length)return '';
 return `<button class="card walert" data-act="gobud"><span>⚠️</span><span>${t('ovBud')}: <b>${o.map(c=>esc(catEm(c.name)+' '+cn(c.name))).join(', ')}</b></span></button>`;
}
function setHome(o){
 Object.assign(C,o);render();renderAcc();
 if(C.hid&&C.fb){const {F,db}=C.fb;F.setDoc(F.doc(db,'households',C.hid),o,{merge:true}).catch(e=>console.error(e))}
}
document.addEventListener('change',e=>{if(e.target.id==='a-ratio')setHome({ratio:e.target.value})});

/* ===== Cuplu: cont, cămin comun, sincronizare Firebase ===== */
const FBC={apiKey:"AIzaSyBxH1RlK8cVajT7nb0f4t-szcoOzvfdddg",authDomain:"cheltuieli-f0c26.firebaseapp.com",projectId:"cheltuieli-f0c26",storageBucket:"cheltuieli-f0c26.firebasestorage.app",messagingSenderId:"590978376968",appId:"1:590978376968:web:5dc9d8a103adf841f038bd"};
const FBV='https://www.gstatic.com/firebasejs/10.14.1/';
const C={fb:null,err:'',uid:null,email:'',hid:null,partner:null,names:{},members:[],code:'',sync:false,syncErr:false,mode:'split',ratio:'equal',seeded:false,booted:false,known:{tx:new Map(),planned:new Map(),subs:new Map(),cats:new Map(),rules:new Map(),goals:new Map(),logs:new Map(),periods:new Map()},unsubs:[]};
let bootRes;const bootP=new Promise(r=>{bootRes=r});
bootP.then(()=>{C.booted=true;apRun()});
let ownSel='me',rq=0;
const pname=()=>(C.partner&&C.names[C.partner])||t('sPartner');
const clean=x=>JSON.parse(JSON.stringify(x));
const ownUid=()=>(C.mode==='common'||ownSel==='shared')?'shared':(ownSel==='partner'&&C.partner)?C.partner:C.uid;
const vis=x=>{if(!C.hid||C.mode==='common'||S.scope==='all')return true;const o=x.own;return S.scope==='me'?o===C.uid:S.scope==='partner'?(!!C.partner&&o===C.partner):o==='shared'};
function schedRender(){clearTimeout(rq);rq=setTimeout(()=>{if(lk==='h'){schedRender();return}render();renderAcc()},30)}

function scopeBar(){
 if(!C.hid||C.mode==='common')return '';
 const o=[['all',t('sAll')],['me',t('sMe')],['partner',pname()],['shared',t('sShared')]];
 return '<div class="scope">'+o.map(([k,l])=>`<button data-act="scope" data-v="${k}" class="${S.scope===k?'on':''}">${esc(l)}</button>`).join('')+'</div>';
}
function settleCard(ym){
 if(!C.hid||C.mode==='common')return '';
 const q=tx.filter(x=>x.date.startsWith(ym)&&x.type==='exp'&&x.own==='shared');
 if(!q.length)return '';
 const tot=q.reduce((a,x)=>a+x.amt,0),mine=q.filter(x=>x.by===C.uid).reduce((a,x)=>a+x.amt,0),r=myRatio(ym),d=mine-tot*r,n=esc(pname());
 const txt=Math.abs(d)<.005?t('even'):d>0?t('oweMe').replace('{n}',n).replace('{a}',fmt(d)):t('iOwe').replace('{n}',n).replace('{a}',fmt(-d));
 return `<div class="card setl"><h3>🤝 ${t('setT')}</h3><p class="note">${t('sharedTot')}: <b>${fmt(tot)}</b>${C.ratio==='income'?' · '+t('splitInfo').replace('{a}',Math.round(r*100)).replace('{b}',Math.round((1-r)*100)).replace('{n}',n):''}</p><p class="setx">${txt}</p></div>`;
}
function syncOwn(){
 const w=$('#ownw');if(!w)return;
 w.hidden=!C.hid||C.mode==='common';if(w.hidden)return;
 if(ownSel==='partner'&&!C.partner)ownSel='me';
 const lab={me:t('sMe'),partner:pname(),shared:t('sShared')};
 w.querySelectorAll('[data-own]').forEach(b=>{b.textContent=lab[b.dataset.own];b.classList.toggle('on',b.dataset.own===ownSel);b.disabled=b.dataset.own==='partner'&&!C.partner});
 $('#paidw').hidden=!(type==='exp'&&ownSel==='shared');
 const by=$('#f-by'),cur=by.value;
 by.innerHTML=`<option value="${C.uid}">${esc(t('sMe'))}</option>`+(C.partner?`<option value="${C.partner}">${esc(pname())}</option>`:'');
 if(cur&&[...by.options].some(o=>o.value===cur))by.value=cur;
}

async function cloudInit(){
 if(!/^https?:$/.test(location.protocol)||self.origin==='null'){C.err='load';bootRes();return}
 try{
  const [A,Au,F]=await Promise.all([import(FBV+'firebase-app.js'),import(FBV+'firebase-auth.js'),import(FBV+'firebase-firestore.js')]);
  const app=A.initializeApp(FBC);
  let db;try{db=F.initializeFirestore(app,{localCache:F.persistentLocalCache()})}catch(e){db=F.getFirestore(app)}
  const auth=Au.getAuth(app);
  C.fb={A,Au,F,app,db,auth};
  Au.onAuthStateChanged(auth,u=>{onUser(u)});
 }catch(e){console.warn('cloud',e);C.err='load';renderAcc();bootRes()}
}
function detach(){C.unsubs.forEach(f=>{try{f()}catch(e){}});C.unsubs=[];C.known={tx:new Map(),planned:new Map(),subs:new Map(),cats:new Map(),rules:new Map(),goals:new Map(),logs:new Map(),periods:new Map()};C.sync=false;C.seeded=false}
async function onUser(u){
 const had=!!C.hid;
 detach();
 if(!u){
  if(had){tx=[];pl=[];subs=[];rules=[];goals=[];logs=[];per=[];cats=defCats();wr();try{localStorage.removeItem(KEY3)}catch(e){}}
  C.uid=null;C.email='';C.hid=null;C.partner=null;C.names={};C.members=[];C.code='';
  renderAcc();render();bootRes();return;
 }
 C.uid=u.uid;C.email=u.email||'';
 try{
  const {F,db}=C.fb;
  let hid=null;
  try{const us=await F.getDoc(F.doc(db,'users',u.uid));hid=us.exists()?us.data().hid||null:null}
  catch(e){try{const k=JSON.parse(localStorage.getItem(KEY3)||'{}');if(k.uid===u.uid)hid=k.hid||null}catch(x){}}
  if(hid)attach(hid);else{C.hid=null;renderAcc();render();bootRes()}
 }catch(e){console.error(e);bootRes()}
}
function attach(hid){
 const {F,db}=C.fb;
 detach();C.hid=hid;
 try{localStorage.setItem(KEY3,JSON.stringify({uid:C.uid,hid}))}catch(e){}
 const first={h:false,tx:false,planned:false,subs:false,cats:false,rules:false,goals:false,logs:false,periods:false};
 const chk=()=>{if(first.h&&first.tx&&first.planned&&first.subs&&first.cats&&first.rules&&first.goals&&first.logs&&first.periods){C.sync=true;if(!C.seeded){C.seeded=true;if(!cats.length)cats=defCats()}bootRes();cloudPush();apRun();ERR.flush(false)}};
 C.unsubs.push(F.onSnapshot(F.doc(db,'households',hid),s=>{
  if(s.exists()){const d=s.data();C.members=d.members||[];C.names=d.names||{};C.code=d.code||'';C.mode=d.mode||'split';C.ratio=d.ratio||'equal';C.partner=C.members.find(m=>m!==C.uid)||null}
  first.h=true;chk();schedRender();
 },e=>{console.error(e);first.h=true;chk()}));
 ['tx','planned','subs','cats','rules','goals','logs','periods'].forEach(k=>{
  C.unsubs.push(F.onSnapshot(F.collection(db,'households',hid,k),s=>{
   const arr=s.docs.map(d=>d.data());
   C.known[k]=new Map(arr.map(x=>[String(x.id),JSON.stringify(x)]));
   if(k==='tx')tx=arr;else if(k==='planned')pl=arr;else if(k==='subs')subs=arr;else if(k==='rules')rules=arr;else if(k==='goals')goals=arr;else if(k==='logs')logs=arr;else if(k==='periods')per=arr;else cats=arr.sort((a,b)=>(a.ord||0)-(b.ord||0)||a.id-b.id);
   first[k]=true;wr();chk();schedRender();
  },e=>{console.error(e);first[k]=true;chk()}));
 });
}
function cloudPush(){
 if(!C.hid||!C.sync||!C.fb)return;
 const {F,db}=C.fb,ops=[];
 [['tx',tx],['planned',pl],['subs',subs],['cats',cats],['rules',rules],['goals',goals],['logs',logs],['periods',per]].forEach(([k,arr])=>{
  const km=C.known[k],seen=new Set();
  arr.forEach(x=>{
   if(k!=='cats'&&k!=='rules'&&k!=='goals'&&k!=='logs'&&k!=='periods'&&!x.own)x.own=C.uid;
   const id=String(x.id),c=clean(x),j=JSON.stringify(c);seen.add(id);
   if(km.get(id)!==j){ops.push([0,k,id,c]);km.set(id,j)}
  });
  [...km.keys()].forEach(id=>{if(!seen.has(id)){ops.push([1,k,id]);km.delete(id)}});
 });
 for(let i=0;i<ops.length;i+=400){
  const b=F.writeBatch(db);
  ops.slice(i,i+400).forEach(([d,k,id,x])=>{const r=F.doc(db,'households',C.hid,k,id);if(d)b.delete(r);else b.set(r,x)});
  b.commit().then(()=>{if(C.syncErr){C.syncErr=false;schedRender()}},e=>{console.error('push',e);C.syncErr=true;schedRender()});
 }
}
function cloudName(){
 if(!C.hid||!C.fb)return;
 const {F,db}=C.fb;
 F.setDoc(F.doc(db,'households',C.hid),{names:{[C.uid]:S.name||''}},{merge:true}).catch(e=>console.error(e));
}
function genCode(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',a=new Uint32Array(8);crypto.getRandomValues(a);return [...a].map(v=>c[v%c.length]).join('')}
async function createHome(){
 const {F,db}=C.fb,hid=F.doc(F.collection(db,'households')).id,code=genCode(),now=Date.now();
 const b=F.writeBatch(db);
 b.set(F.doc(db,'households',hid),{members:[C.uid],names:{[C.uid]:S.name||''},code,createdAt:now});
 b.set(F.doc(db,'invites',code),{hid,createdAt:now});
 b.set(F.doc(db,'users',C.uid),{hid,name:S.name||''},{merge:true});
 await b.commit();
 for(const [k,arr] of [['tx',tx],['planned',pl],['subs',subs],['cats',cats],['rules',rules],['goals',goals],['logs',logs],['periods',per]]){
  for(let i=0;i<arr.length;i+=400){
   const bb=F.writeBatch(db);
   arr.slice(i,i+400).forEach(x=>{if(k!=='cats'&&k!=='rules'&&k!=='goals'&&k!=='logs'&&k!=='periods')x.own=x.own||C.uid;bb.set(F.doc(db,'households',hid,k,String(x.id)),clean(x))});
   await bb.commit();
  }
 }
 attach(hid);
}
async function joinHome(code){
 const {F,db}=C.fb;code=String(code||'').trim().toUpperCase();
 if(!code)throw {code:'nocode'};
 const inv=await F.getDoc(F.doc(db,'invites',code));
 if(!inv.exists())throw {code:'nocode'};
 const hid=inv.data().hid;
 try{localStorage.setItem('cheltuieli_prejoin',JSON.stringify({tx,planned:pl,subs}))}catch(e){}
 await F.updateDoc(F.doc(db,'households',hid),{members:F.arrayUnion(C.uid),['names.'+C.uid]:S.name||''});
 await F.setDoc(F.doc(db,'users',C.uid),{hid,name:S.name||''},{merge:true});
 attach(hid);
}
function fbErr(e){
 const c=(e&&e.code)||'';
 if(/invalid-credential|wrong-password|user-not-found/.test(c))return t('e_cred');
 if(/email-already-in-use/.test(c))return t('e_used');
 if(/weak-password/.test(c))return t('e_weak');
 if(/invalid-email/.test(c))return t('e_mail');
 if(/network|unavailable/.test(c))return t('e_net');
 if(c==='nocode')return t('e_code');
 if(/permission-denied/.test(c))return t('e_full');
 return t('e_gen')+(c?' ('+c+')':'');
}
async function accDo(a){
 if(!['signin','signup','mkhome','joinhome','signout'].includes(a))return;
 const m=$('#acc-msg');m.textContent=t('wait');
 try{
  const {Au,auth}=C.fb;
  if(a==='signin'||a==='signup'){
   const e=$('#a-mail').value.trim(),p=$('#a-pass').value;
   if(!e||!p){m.textContent=t('e_fill');return}
   await (a==='signin'?Au.signInWithEmailAndPassword(auth,e,p):Au.createUserWithEmailAndPassword(auth,e,p));
  }else if(a==='mkhome')await createHome();
  else if(a==='joinhome')await joinHome($('#a-code').value);
  else if(a==='signout')await Au.signOut(auth);
  m.textContent='';
 }catch(e){console.error(e);m.textContent=fbErr(e)}
}
function renderAcc(){
 const el=$('#acc-body');if(!el||$('#acc').hidden)return;
 let h='';
 if(C.err==='load')h=`<p class="hint">${t('a_off')}</p>`;
 else if(!C.fb)h=`<p class="hint">${t('a_load')}</p>`;
 else if(!C.uid)h=`<p class="hint">${t('a_intro')}</p><label><span>${t('email')}</span><input id="a-mail" type="email" autocomplete="email" autocapitalize="off"></label><label><span>${t('pass')}</span><input id="a-pass" type="password" autocomplete="current-password"></label><div class="btns"><button class="pri" data-act="signin">${t('accIn')}</button><button data-act="signup">${t('accUp')}</button></div>`;
 else if(!C.hid)h=`<p class="hint">${t('signedAs').replace('{e}',esc(C.email))}</p><div class="btns"><button class="pri" data-act="mkhome">${t('hCreate')}</button></div><label><span>${t('hCode')}</span><input id="a-code" autocapitalize="characters" autocomplete="off" maxlength="12"></label><div class="btns"><button data-act="joinhome">${t('hJoin')}</button></div><div class="btns"><button data-act="signout">${t('accOut')}</button></div>`;
 else{
  const mem=C.members.map(u=>u===C.uid?esc((S.name||t('sMe'))+' ('+t('sMe')+')'):esc(C.names[u]||t('sPartner'))).join(' · ');
  h=`<p class="hint">${t('signedAs').replace('{e}',esc(C.email))}</p><p class="hint">✅ ${t('hSync')}<br>${t('members')}: ${mem}</p>`;
  h+=`<p class="hint">${t('mTitle')}</p><div class="seg"><button data-act="mode" data-v="common" class="${C.mode==='common'?'on':''}">${t('mCommon')}</button><button data-act="mode" data-v="split" class="${C.mode!=='common'?'on':''}">${t('mSplit')}</button></div><p class="hint">${t(C.mode==='common'?'mCommonH':'mSplitH')}</p>`;
  if(C.mode!=='common')h+=`<label><span>${t('ratio')}</span><select id="a-ratio"><option value="equal"${C.ratio!=='income'?' selected':''}>${t('ratioEq')}</option><option value="income"${C.ratio==='income'?' selected':''}>${t('ratioInc')}</option></select></label>`;
  if(C.members.length<2)h+=`<p class="hint">${t('hMine')}</p><div class="code">${esc(C.code)}</div><p class="hint">${t('hWait')}</p><div class="btns"><button data-act="copycode">${t('copyCode')}</button></div>`;
  h+=`<div class="btns"><button data-act="signout">${t('accOut')}</button></div>`;
 }
 el.innerHTML=h;
}
function openAcc(){$('#acc-msg').textContent='';$('#acc').hidden=false;renderAcc()}
function closeAcc(){$('#acc').hidden=true}
function copyCode(){
 const m=$('#acc-msg');
 (navigator.clipboard?navigator.clipboard.writeText(C.code):Promise.reject()).then(()=>m.textContent=t('copied')).catch(()=>{m.textContent=C.code});
}

let revealed=false;
function countUp(){
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const e=document.querySelector('.sum .big');if(!e)return;
 const m=tx.filter(x=>x.date.startsWith(mk(view))),bal=sum(m,'inc')-sum(m,'exp'),st=performance.now()+450,D=1000;
 (function f(n){const k=Math.max(0,Math.min(1,(n-st)/D));e.textContent=fmt(bal*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(performance.now());
}
function reveal(){
 if(revealed)return;revealed=true;
 const sp=$('#splash');
 document.body.className='go';render();countUp();
 if(sp){sp.classList.add('out');setTimeout(()=>sp.remove(),520)}
 setTimeout(()=>document.body.classList.remove('go'),2400);
}
const T0=performance.now();
try{if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(function(){})}catch(e){}
pinLoad();load();applyStatic();render();if(pinH)lockShow('unlock');cloudInit();apParse();
Promise.race([Promise.all([initDb(),bootP]),new Promise(r=>setTimeout(r,2600))]).then(()=>setTimeout(reveal,Math.max(0,1000-(performance.now()-T0))));
