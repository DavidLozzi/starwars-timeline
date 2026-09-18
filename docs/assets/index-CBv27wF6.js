import{H as i,r as n,s as C,a as f,A as p,j as t,M as E}from"./index-k9t38m8m.js";const k={steps:[{id:"navigation",title:"Navigation",content:`Scroll left and right to explore characters.

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
  margin: 0 0 .5rem 0;
  font-size: 1.5rem;
  color: rgb(${({theme:e})=>e.palette.secondary});
  font-weight: bold;

  ${({theme:e})=>e.breakpoints.sm} {
    font-size: 2rem;
  }
`,T=i.p`
  margin: 0 0 1.5rem 0;
  font-size: .9rem;
  color: rgb(${({theme:e})=>e.palette.lightergray});

  a {
    color: rgb(${({theme:e})=>e.palette.secondary});
  }
`,$=i.div`
  margin-bottom: 2rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`,j=i.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  color: rgb(${({theme:e})=>e.palette.secondary});
  font-weight: 600;

  ${({theme:e})=>e.breakpoints.sm} {
    font-size: 1.5rem;
  }
`,N=i.p`
  margin: 0;
  line-height: 1.6;
  font-size: 1rem;
  color: rgb(${({theme:e})=>e.palette.lightergray});
  white-space: pre-line;
`,z=i.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(${({theme:e})=>e.palette.lightergray}, 0.3);
`,M=i.button`
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
`,o={GuideContainer:w,Title:S,Credit:T,StepContent:$,StepTitle:j,StepText:N,ButtonContainer:z,DismissButton:M},y=n.memo(({step:e})=>t.jsxs(o.StepContent,{children:[t.jsx(o.StepTitle,{children:e.title}),t.jsx(o.StepText,{children:e.content})]}));y.displayName="StepContentMemo";const _=({isOpen:e,onDismiss:g,openSource:d,allowKeyboardDismiss:h=!0})=>{const m=n.useRef(null),u=n.useRef(null),s=n.useCallback(()=>{C(!0,new Date().toISOString()),f.event(p.MENU_ITEM,null,"Onboarding Guide Dismissed"),g()},[g]),v=n.useCallback(()=>{f.event(p.MENU_ITEM,null,"Created By")},[]);return n.useEffect(()=>{if(!e||!h)return;const r=l=>{l.key==="Escape"&&s()};return document.addEventListener("keydown",r),()=>document.removeEventListener("keydown",r)},[e,h,s]),n.useEffect(()=>{e&&m.current&&setTimeout(()=>{m.current?.focus()},100)},[e]),n.useEffect(()=>{if(!e)return;const r=c=>{if(c.key!=="Tab")return;const a=u.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');if(!a||a.length===0)return;const b=a[0],x=a[a.length-1];c.shiftKey?document.activeElement===b&&(c.preventDefault(),x.focus()):document.activeElement===x&&(c.preventDefault(),b.focus())},l=u.current;return l?.addEventListener("keydown",r),()=>l?.removeEventListener("keydown",r)},[e]),n.useEffect(()=>{e&&d&&f.event(p.OPEN_HELP,"onboarding",d)},[e,d]),e?t.jsx(E,{fill:!0,onClickBg:s,onClickModal:()=>{},children:t.jsxs(o.GuideContainer,{ref:u,role:"dialog","aria-labelledby":"onboarding-title","aria-modal":"true",children:[t.jsx(o.Title,{id:"onboarding-title",children:"Welcome to the Ultimate Star Wars Timeline"}),t.jsxs(o.Credit,{children:["Created by ",t.jsx("a",{href:"https://starwars.guide/?utm_source=timeline&utm_medium=app&utm_campaign=credit",target:"_blank",rel:"noreferrer",onClick:v,children:"AurebeshFiles"})]}),k.steps.map(r=>t.jsx(y,{step:r},r.id)),t.jsx(o.ButtonContainer,{children:t.jsx(o.DismissButton,{ref:m,onClick:s,"aria-label":"Dismiss onboarding guide",children:"Got it"})})]})}):null},B=n.memo(_);B.displayName="OnboardingGuide";export{k as DEFAULT_ONBOARDING_CONTENT,B as default};
//# sourceMappingURL=index-CBv27wF6.js.map
