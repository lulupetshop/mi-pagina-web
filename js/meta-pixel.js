/* Lulú Lulú — Meta Pixel */
(function(){
  "use strict";
  const id=String(window.CONFIG?.META_PIXEL_ID||"").trim();
  const debug=window.CONFIG?.DEBUG_PIXEL===true||new URLSearchParams(location.search).get("debug_pixel")==="1";
  if(!/^\d{5,20}$/.test(id)||id==="YOUR_PIXEL_ID")return;
  const last=new Map();
  const uuid=()=>window.crypto&&crypto.randomUUID?crypto.randomUUID():"lulu-"+Date.now()+"-"+Math.random().toString(36).slice(2);
  const once=k=>{const n=Date.now(),p=last.get(k)||0;if(n-p<800)return false;last.set(k,n);return true};
  const log=(n,p,e)=>{if(debug)console.info("[Lulú Meta Pixel]",n,p,"eventID:",e)};
  !(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init",id);window.fbq("track","PageView");
  function track(name,params,key){if(key&&!once(key))return;const eventID=uuid();log(name,params,eventID);window.fbq("track",name,params,{eventID:eventID})}
  const price=(item,mode)=>Number(mode==="mayorista"?item.precioMayorista:item.precioMinorista)||0;
  const contents=(cart,mode)=>cart.map(i=>({id:String(i.productId||i.id),quantity:Number(i.cantidad)||0,item_price:price(i,mode)})).filter(i=>i.id&&i.quantity>0);
  const total=(cart,mode)=>{let v=cart.reduce((s,i)=>s+price(i,mode)*i.quantity,0);if(mode!=="mayorista"){try{if(!localStorage.getItem("lulu:first-purchase-redeemed:v2")&&CONFIG.PRIMERA_COMPRA.ACTIVO)v-=Math.round(v*CONFIG.PRIMERA_COMPRA.DESCUENTO_PCT/100)}catch(e){}if(CONFIG.SEGUNDA_UNIDAD.ACTIVO&&cart.reduce((s,i)=>s+i.cantidad,0)>=2){const u=[];cart.forEach(i=>{for(let n=0;n<i.cantidad;n++)u.push(Number(i.precioMinorista)||0)});u.sort((a,b)=>a-b);v-=Math.round(u[0]*CONFIG.SEGUNDA_UNIDAD.DESCUENTO_PCT/100)}}return Math.max(0,Math.round(v))};
  window.LuluMeta={
    viewContent:(p,m)=>{if(!p)return;const v=Math.min(...p.tamanos.map(t=>Number(m==="mayorista"?t.mayorista:t.minorista)||0));track("ViewContent",{content_ids:[p.id],content_type:"product",content_name:p.nombre,content_category:p.categoria,value:Number(v),currency:"ARS"},"view:"+p.id+":"+m)},
    addToCart:(i,m,q)=>{const v=price(i,m),n=Math.max(1,Number(q)||1);track("AddToCart",{content_ids:[String(i.productId)],content_type:"product",content_name:i.nombre,value:Number(v),currency:"ARS",contents:[{id:String(i.productId),quantity:n,item_price:Number(v)}],num_items:n},"add:"+i.productId+":"+Date.now())},
    initiateCheckout:(cart,m)=>{const c=contents(cart,m),n=c.reduce((s,i)=>s+i.quantity,0);if(n)track("InitiateCheckout",{value:total(cart,m),currency:"ARS",content_ids:c.map(i=>i.id),num_items:n,contents:c},"checkout:"+c.map(i=>i.id+":"+i.quantity).join("|"))},
    contactQuery:t=>track("Contact",{contact_type:t||"consulta"},"contact:"+String(t||"consulta")),
    contactOrder:(cart,m)=>{const c=contents(cart,m),n=c.reduce((s,i)=>s+i.quantity,0);if(n)track("Contact",{contact_type:"pedido",value:total(cart,m),currency:"ARS",content_ids:c.map(i=>i.id),num_items:n,contents:c},"contact:pedido:"+c.map(i=>i.id+":"+i.quantity).join("|"))}
  };
})();