import{H as i,r as t,s as v,a as b,A as x,j as n,M as E}from"./index-0zd2hBEX.js";const k={steps:[{id:"navigation",title:"Navigation",content:`Scroll left and right to explore characters.

Scroll up and down to move through time.`},{id:"characters",title:"Characters",content:"Click on any character to view their information and their own personal timeline."},{id:"search",title:"Find a specific character, movie, or TV show.",content:"Use the search options at the top right to find what you're looking for! Find by Character or filter by Movie or TV Show, Force Sensitive, Species, and more!"}]},w=i.div`
  box-sizing: border-box;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  padding: 1.5rem;
  overflow-y: auto;
  color: ${({theme:e})=>e.palette.white};
  background-color: rgba(${({theme:e})=>e.palette.black}, 0.95);
  border-radius: inherit;
  outline: none;
  position: relative;
  z-index: 101;
  opacity: 0;
  transform: scale(0.95);
  animation: fadeInScale 0.2s ease forwards;

  @keyframes fadeInScale {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  ${({theme:e})=>e.breakpoints.sm} {
    padding: 2rem;
  }

  ${({theme:e})=>e.breakpoints.md} {
    padding: 2.5rem;
  }

  @media screen and (max-width: 320px) {
    padding: 1rem;
    font-size: 0.9rem;
  }
`,S=i.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: rgb(${({theme:e})=>e.palette.secondary});
  font-weight: bold;

  ${({theme:e})=>e.breakpoints.sm} {
    font-size: 2rem;
  }
`,C=i.div`
  margin-bottom: 2rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`,T=i.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  color: rgb(${({theme:e})=>e.palette.secondary});
  font-weight: 600;

  ${({theme:e})=>e.breakpoints.sm} {
    font-size: 1.5rem;
  }
`,$=i.p`
  margin: 0;
  line-height: 1.6;
  font-size: 1rem;
  color: rgb(${({theme:e})=>e.palette.lightergray});
  white-space: pre-line;
`,j=i.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(${({theme:e})=>e.palette.lightergray}, 0.3);
`,N=i.button`
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  min-width: 44px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  background-color: rgb(${({theme:e})=>e.palette.secondary});
  color: rgb(${({theme:e})=>e.palette.black});
  border: none;
  transition: opacity 0.2s ease, transform 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid rgb(${({theme:e})=>e.palette.secondary});
    outline-offset: 2px;
  }
`,r={GuideContainer:w,Title:S,StepContent:C,StepTitle:T,StepText:$,ButtonContainer:j,DismissButton:N},y=t.memo(({step:e})=>n.jsxs(r.StepContent,{children:[n.jsx(r.StepTitle,{children:e.title}),n.jsx(r.StepText,{children:e.content})]}));y.displayName="StepContentMemo";const z=({isOpen:e,onDismiss:u,openSource:c,allowKeyboardDismiss:p=!0})=>{const m=t.useRef(null),f=t.useRef(null),s=t.useCallback(()=>{v(!0,new Date().toISOString()),b.event(x.MENU_ITEM,null,"Onboarding Guide Dismissed"),u()},[u]);return t.useEffect(()=>{if(!e||!p)return;const o=l=>{l.key==="Escape"&&s()};return document.addEventListener("keydown",o),()=>document.removeEventListener("keydown",o)},[e,p,s]),t.useEffect(()=>{e&&m.current&&setTimeout(()=>{m.current?.focus()},100)},[e]),t.useEffect(()=>{if(!e)return;const o=d=>{if(d.key!=="Tab")return;const a=f.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');if(!a||a.length===0)return;const g=a[0],h=a[a.length-1];d.shiftKey?document.activeElement===g&&(d.preventDefault(),h.focus()):document.activeElement===h&&(d.preventDefault(),g.focus())},l=f.current;return l?.addEventListener("keydown",o),()=>l?.removeEventListener("keydown",o)},[e]),t.useEffect(()=>{e&&c&&b.event(x.OPEN_HELP,"onboarding",c)},[e,c]),e?n.jsx(E,{fill:!0,onClickBg:s,onClickModal:()=>{},children:n.jsxs(r.GuideContainer,{ref:f,role:"dialog","aria-labelledby":"onboarding-title","aria-modal":"true",children:[n.jsx(r.Title,{id:"onboarding-title",children:"Welcome to the Ultimate Star Wars Timeline"}),k.steps.map(o=>n.jsx(y,{step:o},o.id)),n.jsx(r.ButtonContainer,{children:n.jsx(r.DismissButton,{ref:m,onClick:s,"aria-label":"Dismiss onboarding guide",children:"Got it"})})]})}):null},D=t.memo(z);D.displayName="OnboardingGuide";export{k as DEFAULT_ONBOARDING_CONTENT,D as default};
//# sourceMappingURL=index-D3fhpdc2.js.map
