/**
 * API Detector Pro - Core System v4
 * Protegido contra inspección
 */
(function(){
    "use strict";
    
    // Anti-debugger
    setInterval(function(){
        var start=performance.now();
        debugger;
        var end=performance.now();
        if(end-start>100){document.body.innerHTML='';}
    },1000);
    
    // Anti-console (solo en producción)
    var _console=window.console;
    window.console={log:function(){},warn:function(){},error:function(){},table:function(){},clear:function(){}};
    
    // Datos encriptados en Base64
    var _d1="Q2hpenVHejIwMjRTZWNyZXQ=";
    var _d2="S2VsbHlTb2ZpYTg4OTA=";
    var _d3="Q29xdWl0b1NleHk4ODkwMg==";
    
    // Decodificar
    var CS=atob(_d1);
    var AU=atob(_d2);
    var AP=atob(_d3);
    
    // Sistema Premium
    window.CODE_SECRET=CS;
    window.MAX_FREE_ATTEMPTS=5;
    window.PAYPAL_LINK="https://paypal.me/ChizuGz";
    
    window.initStorage=function(){
        var t=new Date().toDateString();
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        if(s.lastDate!==t&&!s.premium){s.attempts=0;s.lastDate=t;localStorage.setItem('apiDetectorData',JSON.stringify(s));}
        if(!s.generatedCodes){s.generatedCodes=[];localStorage.setItem('apiDetectorData',JSON.stringify(s));}
        return s;
    };
    
    window.checkPremiumStatus=function(){
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        if(s.premium&&s.premiumExpiry){var n=Date.now();if(n>s.premiumExpiry){s.premium=false;s.premiumExpiry=null;s.premiumPlan=null;localStorage.setItem('apiDetectorData',JSON.stringify(s));return false;}return true;}
        return false;
    };
    
    window.getAttemptsLeft=function(){
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        if(window.checkPremiumStatus())return Infinity;
        return Math.max(0,5-(s.attempts||0));
    };
    
    window.useAttempt=function(){
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        if(!s.attempts)s.attempts=0;s.attempts++;
        localStorage.setItem('apiDetectorData',JSON.stringify(s));
    };
    
    window.simpleHash=function(str){
        var h=0;
        for(var i=0;i<str.length;i++){var c=str.charCodeAt(i);h=((h<<5)-h)+c;h=h&h;}
        return Math.abs(h).toString(36).toUpperCase();
    };
    
    window.generatePremiumCode=function(plan){
        var ts=Date.now();
        var r=Math.random().toString(36).substring(2,6).toUpperCase();
        var base=CS+"_"+plan+"_"+ts+"_"+r;
        var hash=window.simpleHash(base);
        var prefix=plan.substring(0,3).toUpperCase();
        return prefix+"-"+hash.substring(0,4)+"-"+r;
    };
    
    window.verifyCode=function(code){
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        var codes=s.generatedCodes||[];
        var cleanCode=code.toUpperCase().replace(/\s/g,'');
        var f=null;
        for(var i=0;i<codes.length;i++){if(codes[i].code===cleanCode){f=codes[i];break;}}
        if(!f)return{valid:false,reason:'Código no válido'};
        if(f.used)return{valid:false,reason:'Código ya fue usado'};
        if(Date.now()-f.created>30*24*60*60*1000)return{valid:false,reason:'Código expirado'};
        return{valid:true,plan:f.plan,data:f};
    };
    
    window.saveGeneratedCode=function(code,plan){
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        if(!s.generatedCodes)s.generatedCodes=[];
        s.generatedCodes.push({code:code,plan:plan,created:Date.now(),used:false,usedAt:null,usedBy:null});
        localStorage.setItem('apiDetectorData',JSON.stringify(s));
    };
    
    window.activatePremiumWithCode=function(code){
        var v=window.verifyCode(code);
        if(!v.valid)return{success:false,message:v.reason};
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        var now=Date.now();
        var dur=0;
        if(v.plan==='week')dur=7*24*60*60*1000;
        if(v.plan==='month')dur=30*24*60*60*1000;
        if(v.plan==='3months')dur=90*24*60*60*1000;
        var cleanCode=code.toUpperCase().replace(/\s/g,'');
        for(var i=0;i<s.generatedCodes.length;i++){
            if(s.generatedCodes[i].code===cleanCode){s.generatedCodes[i].used=true;s.generatedCodes[i].usedAt=now;break;}
        }
        s.premium=true;s.premiumExpiry=now+dur;s.premiumPlan=v.plan;s.premiumCode=cleanCode;s.attempts=0;
        localStorage.setItem('apiDetectorData',JSON.stringify(s));
        return{success:true,plan:v.plan,expiry:new Date(now+dur).toLocaleDateString()};
    };
    
    window.updateUI=function(){
        var ip=window.checkPremiumStatus();
        var al=window.getAttemptsLeft();
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        var pb=document.getElementById('premiumBadge');
        var ub=document.getElementById('upgradeBtn');
        if(ip){pb.classList.add('show');if(ub)ub.style.display='none';}
        else{pb.classList.remove('show');if(ub)ub.style.display='flex';}
        var dots=document.getElementById('attemptsDots');dots.innerHTML='';
        if(ip){
            dots.innerHTML='<span style="color:#ffd700;font-weight:700;">⭐ ILIMITADO</span>';
            document.getElementById('attemptsText').innerHTML='<strong style="color:#ffd700;">Premium Activo</strong> • Análisis ilimitados';
        }else{
            var u=s.attempts||0;
            for(var i=0;i<5;i++){var d=document.createElement('div');d.className='attempt-dot '+(i<u?'used':'available');dots.appendChild(d);}
            document.getElementById('attemptsText').innerHTML='<strong>'+al+'</strong> intentos restantes de 5';
        }
        var ls=document.getElementById('lockScreen');
        var ip2=document.getElementById('inputSection');
        var sb=document.getElementById('scanBtn');
        if(!ip&&al<=0){ls.classList.add('show');ip2.classList.add('locked');if(sb)sb.disabled=true;}
        else{ls.classList.remove('show');ip2.classList.remove('locked');if(sb)sb.disabled=false;}
    };
    
    // Admin
    window.isAdminLoggedIn=function(){return localStorage.getItem('_adt')==='1';};
    
    window.openAdminLogin=function(){
        if(window.isAdminLoggedIn()){window.toggleAdminPanel();return;}
        var o=document.getElementById('adminLoginOverlay');
        if(o){o.classList.add('show');document.getElementById('adminUsername').value='';document.getElementById('adminPassword').value='';document.getElementById('adminLoginError').textContent='';setTimeout(function(){document.getElementById('adminUsername').focus();},100);}
    };
    
    window.closeAdminLogin=function(){var o=document.getElementById('adminLoginOverlay');if(o)o.classList.remove('show');};
    
    window.verifyAdminLogin=function(){
        var u=document.getElementById('adminUsername')?document.getElementById('adminUsername').value.trim():'';
        var p=document.getElementById('adminPassword')?document.getElementById('adminPassword').value:'';
        var e=document.getElementById('adminLoginError');
        if(!u||!p){if(e)e.textContent='⚠️ Completa todos los campos';return;}
        if(u===AU&&p===AP){
            localStorage.setItem('_adt','1');if(e)e.textContent='';
            window.closeAdminLogin();window.toggleAdminPanel();
            document.getElementById('adminLoggedIn').classList.add('show');
            document.getElementById('adminLoginBtn').innerHTML='⚙️ Panel Admin';
        }else{if(e)e.textContent='❌ Usuario o contraseña incorrectos';document.getElementById('adminPassword').value='';}
    };
    
    window.adminLogout=function(){
        localStorage.removeItem('_adt');
        document.getElementById('adminPanel').classList.remove('show');
        document.getElementById('adminLoggedIn').classList.remove('show');
        document.getElementById('adminLoginBtn').innerHTML='🔐 Admin';
    };
    
    window.toggleAdminPanel=function(){
        var p=document.getElementById('adminPanel');
        p.classList.toggle('show');
        if(p.classList.contains('show'))document.getElementById('adminLoggedIn').classList.add('show');
    };
    
    window.generateCode=function(){
        var pl=document.getElementById('adminPlanSelect').value;
        var c=window.generatePremiumCode(pl);
        window.saveGeneratedCode(c,pl);
        var o=document.getElementById('adminOutput');
        if(o){o.textContent=c;o.style.color='#ffd700';}
    };
    
    window.copyAdminCode=function(){
        var o=document.getElementById('adminOutput');
        if(!o)return;var c=o.textContent;
        if(c&&c!=='El código aparecerá aquí...'){navigator.clipboard.writeText(c).then(function(){o.textContent=c+' (copiado!)';setTimeout(function(){o.textContent=c;},2000);});}
    };
    
    window.listActiveCodes=function(){
        var s=JSON.parse(localStorage.getItem('apiDetectorData')||'{}');
        var codes=s.generatedCodes||[];
        var el=document.getElementById('adminCodesList');
        if(!el)return;
        if(codes.length===0){el.textContent='No hay códigos generados';return;}
        var h='';var r=codes.slice().reverse();
        for(var i=0;i<r.length;i++){
            var c=r[i];var st=c.used?'🔴 USADO':'🟢 DISPONIBLE';
            var pn={week:'1 Sem',month:'1 Mes','3months':'3 Meses'};
            h+=st+' | '+c.code+' | '+(pn[c.plan]||c.plan)+' | '+new Date(c.created).toLocaleDateString()+'\n';
        }
        el.textContent=h;
    };
    
    window.openPremiumModal=function(){
        var m=document.getElementById('premiumModal');
        if(m){m.classList.add('show');document.getElementById('unlockMessage').textContent='';document.getElementById('unlockCode').value='';}
    };
    
    window.closePremiumModal=function(){
        var m=document.getElementById('premiumModal');
        if(m)m.classList.remove('show');
        var ap=document.getElementById('adminPanel');
        if(ap)ap.classList.remove('show');
    };
    
    window.selectPlan=function(plan){
        var prices={week:5,month:7,'3months':10};
        var names={week:'1 Semana',month:'1 Mes','3months':'3 Meses'};
        if(confirm('Has seleccionado: Premium '+names[plan]+' - $'+prices[plan]+' USD\n\n¿Continuar al pago?')){window.open('https://paypal.me/ChizuGz','_blank');}
    };
    
    window.verifyUnlockCode=function(){
        var ci=document.getElementById('unlockCode');
        var me=document.getElementById('unlockMessage');
        var btn=document.getElementById('unlockBtn');
        var code=ci?ci.value.trim():'';
        if(!code){if(me){me.textContent='⚠️ Ingresa un código';me.className='unlock-message error';}return;}
        if(btn){btn.disabled=true;btn.textContent='Verificando...';}
        setTimeout(function(){
            var r=window.activatePremiumWithCode(code);
            if(r.success){
                if(me){me.textContent='✅ ¡Premium activado! Plan: '+r.plan+' • Expira: '+r.expiry;me.className='unlock-message success';}
                if(ci)ci.value='';
                setTimeout(function(){window.closePremiumModal();window.updateUI();},1500);
            }else{if(me){me.textContent='❌ '+r.message;me.className='unlock-message error';}}
            if(btn){btn.disabled=false;btn.textContent='Desbloquear';}
        },1000);
    };
    
    // API Database
    var apiDatabase={
        'tiktok':{type:'TikTok API',icon:'🎵',description:'API oficial de TikTok',example:{"data":{"id":"7212345678901234567","desc":"Video viral","author":{"unique_id":"@usuario"},"stats":{"play_count":2000000}}}},
        'youtube':{type:'YouTube Data API',icon:'📺',description:'API de Google para videos',example:{"kind":"youtube#videoListResponse","items":[{"id":"dQw4w9WgXcQ","snippet":{"title":"Video Ejemplo"}}]}},
        'github':{type:'GitHub API',icon:'🐙',description:'API de repositorios',example:{"login":"octocat","id":1,"type":"User"}},
        'weather':{type:'Weather API',icon:'🌤️',description:'Servicio meteorológico',example:{"weather":[{"main":"Clear"}],"main":{"temp":22.5}}},
        'jsonplaceholder':{type:'JSON Placeholder',icon:'🧪',description:'API fake para testing',example:{"userId":1,"id":1,"title":"ejemplo"}},
        'pokeapi':{type:'PokéAPI',icon:'🎮',description:'Datos de Pokémon',example:{"id":25,"name":"pikachu"}},
        'default':{type:'REST API Genérica',icon:'🔌',description:'API REST estándar',example:{"status":"success","code":200}}
    };
    
    window.detectApiType=function(url){
        var lu=url.toLowerCase();
        for(var k in apiDatabase){if(lu.includes(k))return apiDatabase[k];}
        if(lu.includes('api.'))return{type:'API Corporativa',icon:'🏢',description:'API empresarial',example:apiDatabase.default.example};
        if(lu.includes('graphql'))return{type:'GraphQL API',icon:'◈',description:'API GraphQL',example:apiDatabase.default.example};
        return apiDatabase.default;
    };
    
    window.syntaxHighlight=function(json){
        if(typeof json!=='string')json=JSON.stringify(json,null,2);
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,function(m){
            var cls='number';
            if(/^"/.test(m)){if(/:$/.test(m)){cls='key';m=m.slice(0,-1)+'</span>:';}else{cls='string';}}
            else if(/true|false/.test(m)){cls='boolean';}
            return '<span class="'+cls+'">'+m+'</span>';
        });
    };
    
    window.examineApi=async function(){
        var al=window.getAttemptsLeft();
        var ip=window.checkPremiumStatus();
        if(!ip&&al<=0){window.openPremiumModal();return;}
        var ui=document.getElementById('apiUrl');
        var url=ui?ui.value.trim():'';
        var btn=document.getElementById('scanBtn');
        var res=document.getElementById('results');
        var badge=document.getElementById('detectionBadge');
        if(!url){alert('Por favor ingresa una URL');return;}
        if(btn){btn.classList.add('loading');btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg> Analizando...';}
        var apiInfo=window.detectApiType(url);
        if(badge){badge.classList.add('show');document.getElementById('badgeIcon').textContent=apiInfo.icon;document.getElementById('detectedType').textContent=apiInfo.type;}
        var st=performance.now();
        try{
            var ctrl=new AbortController();
            var tid=setTimeout(function(){ctrl.abort();},10000);
            var resp=await fetch(url,{method:'GET',headers:{'Accept':'application/json'},signal:ctrl.signal});
            clearTimeout(tid);
            var lat=(performance.now()-st).toFixed(0);
            var ct=resp.headers.get('content-type')||'unknown';
            var data;
            if(ct.includes('application/json')){data=await resp.json();}else{data=await resp.text();}
            if(res)res.classList.add('show');
            var si=document.getElementById('statusIcon');
            var st2=document.getElementById('statusTitle');
            var sd=document.getElementById('statusDesc');
            if(resp.ok){
                si.textContent='✓';si.className='status-icon working';
                st2.textContent='¡API Funcionando!';st2.className='status-title working';
                sd.textContent=apiInfo.description;
            }else{
                si.textContent='⚠';si.className='status-icon error';
                st2.textContent='Error '+resp.status;st2.className='status-title error';
                sd.textContent='La API responde pero con error';
            }
            document.getElementById('latency').textContent=lat+'ms';
            document.getElementById('statusCode').textContent=resp.status;
            document.getElementById('contentType').textContent=ct.split(';')[0];
            document.getElementById('size').textContent=JSON.stringify(data).length+' bytes';
            var ed=typeof data==='object'&&Object.keys(data).length>0?data:apiInfo.example;
            document.getElementById('exampleCode').innerHTML=window.syntaxHighlight(ed);
            document.getElementById('exampleBadge').textContent=ct.includes('json')?'JSON':'TEXT';
            if(!ip){window.useAttempt();window.updateUI();}
        }catch(err){
            if(res)res.classList.add('show');
            var si=document.getElementById('statusIcon');
            si.textContent='✕';si.className='status-icon error';
            document.getElementById('statusTitle').textContent='API No Disponible';
            document.getElementById('statusTitle').className='status-title error';
            var msg=err.message;
            if(err.name==='AbortError')msg='Timeout - La API no responde';
            document.getElementById('statusDesc').textContent=msg;
            document.getElementById('latency').textContent='Timeout';
            document.getElementById('statusCode').textContent='Error';
            document.getElementById('contentType').textContent='-';
            document.getElementById('size').textContent='-';
            document.getElementById('exampleCode').innerHTML=window.syntaxHighlight(apiInfo.example);
            document.getElementById('exampleBadge').textContent='Ejemplo';
            if(!ip){window.useAttempt();window.updateUI();}
        }
        if(btn){btn.classList.remove('loading');btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> Examinar';}
    };

    // Init
    window.addEventListener('load',function(){
        window.initStorage();
        window.updateUI();
        if(window.isAdminLoggedIn()){
            document.getElementById('adminLoginBtn').innerHTML='⚙️ Panel Admin';
            document.getElementById('adminLoggedIn').classList.add('show');
        }
        var au=document.getElementById('apiUrl');
        if(au){au.addEventListener('keypress',function(e){if(e.key==='Enter')window.examineApi();});}
        var pm=document.getElementById('premiumModal');
        if(pm){pm.addEventListener('click',function(e){if(e.target===this)window.closePremiumModal();});}
        var uc=document.getElementById('unlockCode');
        if(uc){uc.addEventListener('keypress',function(e){if(e.key==='Enter')window.verifyUnlockCode();});}
        var ap=document.getElementById('adminPassword');
        if(ap){ap.addEventListener('keypress',function(e){if(e.key==='Enter')window.verifyAdminLogin();});}
        var alo=document.getElementById('adminLoginOverlay');
        if(alo){alo.addEventListener('click',function(e){if(e.target===this)window.closeAdminLogin();});}
    });
})();
