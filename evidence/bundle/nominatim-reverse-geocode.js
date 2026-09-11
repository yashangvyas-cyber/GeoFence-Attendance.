/* SOURCE: staging-app.collabcrm.com JS chunk index-9756f2a7.js, offset ~6697961
   Reverse geocoding called DIRECTLY FROM THE BROWSER, uncached, no identifying User-Agent — see the OSM usage policy note in the R&D doc.
   Verbatim minified slice. Not edited. */

f({popupopen:l,popupclose:c}),(d=n.overlayContainer)==null||d.unbindPopup(),n.map.removeLayer(o)}},[t,n,a,r])}),K8r=U8r(function({url:t,...n},r){const a=new dV.TileLayer(t,o8e(n,r));return l8e(a,r)},function(t,n,r){H8r(t,n,r);const{url:a}=n;a!=null&&a!==r.url&&t.setUrl(a)}),bK={CLOCK_IN_INACTIVE:null,CLOCK_IN_ACTIVE:null,CLOCK_OUT_INACTIVE:null,CLOCK_OUT_ACTIVE:null},Q8r=(e,t)=>{const a=`${e?"CLOCK_IN":"CLOCK_OUT"}_${t?"ACTIVE":"INACTIVE"}`;if(bK[a])return bK[a];const s=e?"#22c55e":"#ef4444",o=t?"#4f46e5":"#ffffff",l=t?18:14,c=t?3:2;return bK[a]=bRt.divIcon({className:"custom-map-marker",html:`<div style="
      width: ${l}px;
      height: ${l}px;
      background: ${s};
      border: ${c}px solid ${o};
      border-radius: 50%;
    "></div>`,iconSize:[l+c*2,l+c*2],iconAnchor:[(l+c*2)/2,(l+c*2)/2],popupAnchor:[0,-(l/2+c)]}),bK[a]},J8r=async(e,t)=>{try{const r=await(await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e}&lon=${t}&zoom=18&addressdetails=1`,{headers:{"Accept-Language":"en"}})).json();return(r==null?void 0:r.display_name)||""}catch{return""}},wRt=({center:e,zoom:t,shouldFly:n})=>{const r=V8r();return w.useEffect(()=>{const a=setTimeout(()=>{r.invalidateSize()},300);return()=>clearTimeout(a)},[r]),w.useEffect(()=>{e&&n&&r.flyTo(e,t||16,{duration:.8})},[e,t,n,r]),null};wRt