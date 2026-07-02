(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var R=window.__ROUTES__||{};
  var money=function(c){try{return new Intl.NumberFormat('de-DE',{style:'currency',currency:(window.__CURRENCY__||'EUR')}).format((c||0)/100)}catch(e){return ((c||0)/100).toFixed(2)+' €'}};

  /* stars */
  var STAR='<svg viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .6-5.3 4.6 1.6 6.9L12 17.3 5.1 20.6l1.6-6.9L1.4 9.1l7-.6z"/></svg>';
  $$('[data-stars]').forEach(function(e){var n=parseInt(e.getAttribute('data-stars'),10)||5;e.innerHTML=new Array(n+1).join(STAR)});

  /* reveal */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -6% 0px'});
    $$('[data-reveal]').forEach(function(e){io.observe(e)});
  }else{$$('[data-reveal]').forEach(function(e){e.classList.add('in')})}

  /* toast */
  var toastEl=$('[data-toast]'),tt;
  function toast(msg){if(!toastEl)return;toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toastEl.classList.remove('show')},1900)}

  /* mobile menu */
  var sheet=$('[data-sheet]');
  $$('[data-menu-open]').forEach(function(b){b.addEventListener('click',function(){if(sheet)sheet.classList.add('open')})});
  $$('[data-menu-close]').forEach(function(b){b.addEventListener('click',function(){if(sheet)sheet.classList.remove('open')})});

  /* ---------- CART ---------- */
  var overlay=$('[data-overlay]'),drawer=$('[data-drawer]'),useDrawer=window.__DRAWER__!==false;
  function openDrawer(){if(!drawer)return;overlay.hidden=false;requestAnimationFrame(function(){overlay.classList.add('show');drawer.classList.add('show')})}
  function closeDrawer(){if(!drawer)return;overlay.classList.remove('show');drawer.classList.remove('show');setTimeout(function(){overlay.hidden=true},320)}
  if(overlay)overlay.addEventListener('click',closeDrawer);
  $$('[data-drawer-close]').forEach(function(b){b.addEventListener('click',closeDrawer)});

  function renderCart(cart){
    $$('[data-cart-count]').forEach(function(e){e.textContent=cart.item_count});
    var box=$('[data-drawer-items]'),ft=$('[data-drawer-total]');
    if(box){
      if(!cart.items.length){box.innerHTML='<div class="drawer__empty">Dein Warenkorb ist leer.</div>'}
      else{
        box.innerHTML=cart.items.map(function(it,i){
          return '<div class="ci"><img src="'+(it.image?it.image.replace(/(\.[a-z]+)(\?.*)?$/i,'_140x$1'):'')+'" alt=""><div class="ci__m"><b>'+it.product_title+'</b>'+(it.variant_title&&it.variant_title!=='Default Title'?'<div class="v">'+it.variant_title+'</div>':'')+'<div class="ci__q"><button data-dec="'+(i+1)+'" aria-label="weniger">−</button><span>'+it.quantity+'</span><button data-inc="'+(i+1)+'" aria-label="mehr">+</button></div></div><div style="font-weight:600">'+money(it.final_line_price)+'</div></div>'
        }).join('');
      }
    }
    if(ft)ft.textContent=money(cart.total_price);
    bindCartQty();
  }
  function fetchCart(){return fetch(R.cart+'.js',{headers:{'Accept':'application/json'}}).then(function(r){return r.json()})}
  function changeLine(line,qty){return fetch(R.cart_change,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({line:line,quantity:qty})}).then(function(r){return r.json()}).then(renderCart)}
  function bindCartQty(){
    $$('[data-inc]').forEach(function(b){b.onclick=function(){var l=+b.getAttribute('data-inc');changeLine(l,cartQty(l)+1)}});
    $$('[data-dec]').forEach(function(b){b.onclick=function(){var l=+b.getAttribute('data-dec');changeLine(l,Math.max(0,cartQty(l)-1))}});
  }
  var _cart=null;
  function cartQty(l){return (_cart&&_cart.items[l-1])?_cart.items[l-1].quantity:1}

  function addToCart(id,qty){
    if(!id){toast('Bitte Variante wählen');return}
    fetch(R.cart_add,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:[{id:id,quantity:qty||1}]})})
      .then(function(r){return r.json()})
      .then(function(){return fetchCart()})
      .then(function(cart){_cart=cart;renderCart(cart);toast('In den Warenkorb ✓');if(useDrawer)openDrawer()})
      .catch(function(){toast('Etwas ist schiefgelaufen')});
  }
  // header cart button opens drawer (or navigates)
  $$('[data-cart-open]').forEach(function(b){b.addEventListener('click',function(e){if(useDrawer&&drawer){e.preventDefault();fetchCart().then(function(c){_cart=c;renderCart(c);openDrawer()})}})});
  fetchCart().then(function(c){_cart=c;renderCart(c)});

  /* ---------- PRODUCT ---------- */
  var pj=$('#ProductJson');
  if(pj){
    var P=JSON.parse(pj.textContent);
    var sel={};
    $$('[data-opt]').forEach(function(g){var pos=g.getAttribute('data-opt');var pressed=g.querySelector('[aria-pressed="true"]');if(pressed)sel[pos]=pressed.getAttribute('data-value')});
    function currentVariant(){
      return P.variants.filter(function(v){return v.available!==false}).find(function(v){
        return Object.keys(sel).every(function(pos){return v.options[(+pos)-1]===sel[pos]});
      }) || P.variants.find(function(v){return Object.keys(sel).every(function(pos){return v.options[(+pos)-1]===sel[pos]})}) || P.variants[0];
    }
    var qty=parseInt((($('[data-bundle][aria-pressed="true"]')||{}).getAttribute?$('[data-bundle][aria-pressed="true"]').getAttribute('data-qty'):1),10)||1;
    function update(){
      var v=currentVariant();
      var perComp=null;
      var bundle=$('[data-bundle][aria-pressed="true"]');
      qty=bundle?(parseInt(bundle.getAttribute('data-qty'),10)||1):1;
      var pct=bundle?(parseFloat(bundle.getAttribute('data-off'))||0):0;
      var unit=v?v.price:0;
      var total=Math.round(unit*qty*(1-pct/100));
      $$('[data-price]').forEach(function(e){e.textContent=money(unit)});
      $$('[data-compare]').forEach(function(e){e.textContent=v&&v.compare_at_price>unit?money(v.compare_at_price):''});
      $$('[data-total]').forEach(function(e){e.textContent=money(total)});
      $$('[data-add]').forEach(function(b){b.setAttribute('data-variant',v?v.id:'');b.setAttribute('data-qty',qty);
        if(v&&v.available===false){b.setAttribute('disabled','');b.textContent='Ausverkauft'}else{b.removeAttribute('disabled')}});
      // gallery image for variant
      if(v&&v.featured_image&&v.featured_image.src){var gi=$('[data-gmain-img]');if(gi){gi.src=v.featured_image.src;}}
    }
    $$('[data-opt] [data-value]').forEach(function(btn){btn.addEventListener('click',function(){
      var g=btn.closest('[data-opt]');$$('[data-value]',g).forEach(function(x){x.setAttribute('aria-pressed','false')});btn.setAttribute('aria-pressed','true');
      sel[g.getAttribute('data-opt')]=btn.getAttribute('data-value');
      var nm=g.querySelector('[data-opt-name]')||$('[data-opt-name-'+g.getAttribute('data-opt')+']');
      var lbl=document.querySelector('[data-selected-'+g.getAttribute('data-opt')+']');if(lbl)lbl.textContent=btn.getAttribute('data-value');
      var cssc=btn.getAttribute('data-css');
      update();
    })});
    $$('[data-bundle]').forEach(function(b){b.addEventListener('click',function(){
      $$('[data-bundle]').forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');update();
    })});
    update();
  }

  // add buttons (product + sticky + express)
  $$('[data-add]').forEach(function(b){b.addEventListener('click',function(){
    var id=b.getAttribute('data-variant')||b.getAttribute('data-default-variant');
    addToCart(id?+id:null,parseInt(b.getAttribute('data-qty'),10)||1);
  })});

  /* thumbnails gallery */
  $$('[data-thumb]').forEach(function(t){t.addEventListener('click',function(){
    $$('[data-thumb]').forEach(function(x){x.setAttribute('aria-pressed','false')});t.setAttribute('aria-pressed','true');
    var src=t.getAttribute('data-src');var gi=$('[data-gmain-img]');if(gi&&src){gi.src=src}
  })});

  /* newsletter (demo) */
  $$('[data-news]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();toast('Willkommen bei pouched ✓');f.reset&&f.reset()})});

  /* sticky buy bar */
  var sticky=$('[data-sticky]'),anchor=$('[data-sticky-anchor]');
  if('IntersectionObserver' in window && sticky && anchor){
    new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting && e.boundingClientRect.top<0){sticky.classList.add('show')}else{sticky.classList.remove('show')}
    })},{threshold:0}).observe(anchor);
  }
})();
