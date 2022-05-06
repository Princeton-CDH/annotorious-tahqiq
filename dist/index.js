(()=>{"use strict";var t,e={};t=e,Object.defineProperty(t,"__esModule",{value:!0}),t.default=class{constructor(t,e,n){this.anno=t,this.storage=e,this.anno.disableEditor=!0,this.annotationContainer=n,document.addEventListener("annotations-loaded",this.handleAnnotationsLoaded.bind(this)),this.anno.on("createSelection",this.handleCreateSelection.bind(this)),this.anno.on("selectAnnotation",this.handleSelectAnnotation.bind(this))}handleAnnotationsLoaded(){this.annotationContainer.querySelectorAll(".annotation-display-container").forEach((t=>t.remove())),this.anno.getAnnotations().forEach((t=>{this.annotationContainer.append(this.createDisplayBlock(t))}))}async handleCreateSelection(t){const e=this.createEditorBlock(t);e&&this.annotationContainer.append(e)}handleSelectAnnotation(t){this.makeAllReadOnly();const e=document.querySelector('[data-annotation-id="'+t.id+'"]');e&&e instanceof HTMLElement&&this.makeEditable(e,t)}createDisplayBlock(t){const e=document.createElement("div");e.setAttribute("class","annotation-display-container");const n=document.createElement("div");return Array.isArray(t.body)&&t.body.length>0&&(n.innerHTML=t.body[0].value),e.append(n),void 0!==t.id&&(e.dataset.annotationId=t.id,n.addEventListener("click",(()=>{this.anno.selectAnnotation(t.id),this.makeAllReadOnly(),this.makeEditable(e,t)}))),e}makeEditable(t,e){if("annotation-edit-container"==t.getAttribute("class"))return;t.setAttribute("class","annotation-edit-container");const n=t.querySelector("div");n&&(n.setAttribute("class","annotation-editor"),n.setAttribute("contenteditable","true"),n.focus(),console.log("textinput focus"));const a=document.createElement("button");a.setAttribute("class","save"),a.textContent="Save";const o=document.createElement("button");if(o.setAttribute("class","cancel"),o.textContent="Cancel",t.append(a),t.append(o),a.onclick=async()=>{e.motivation="supplementing",Array.isArray(e.body)&&0==e.body.length?e.body.push({type:"TextualBody",purpose:"transcribing",value:n?.textContent||"",format:"text/html"}):Array.isArray(e.body)&&(e.body[0].value=n?.textContent||""),await this.anno.updateSelected(e),this.anno.saveSelected(),this.makeReadOnly(t)},o.addEventListener("click",(()=>{this.anno.cancelSelected(),t.dataset.annotationId?this.makeReadOnly(t,e):t.remove()})),t.dataset.annotationId){console.log("makeEditable existing anno"+t.dataset.annotationId);const e=document.createElement("button");e.setAttribute("class","delete"),e.textContent="Delete",t.append(e),e.addEventListener("click",(()=>{this.anno.removeAnnotation(t.dataset.annotationId),t.remove(),this.storage.adapter.delete(t.dataset.annotationId)}))}return t}makeReadOnly(t,e){t.setAttribute("class","annotation-display-container");const n=t.querySelector("div");return n&&(n.setAttribute("class",""),n.setAttribute("contenteditable","false"),e&&void 0!==e.body&&Array.isArray(e.body)&&(n.innerHTML=e.body[0].value,this.anno.addAnnotation(e))),t.querySelectorAll("button").forEach((t=>t.remove())),t}makeAllReadOnly(){document.querySelectorAll(".annotation-edit-container").forEach((t=>{t instanceof HTMLElement&&this.makeReadOnly(t)}))}createEditorBlock(t){return this.makeEditable(this.createDisplayBlock(t),t)}},module.exports=e})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJtYXBwaW5ncyI6Im1GQTJOQSxVQXZOQSxNQVNJQSxZQUFZQyxFQUFXQyxFQUFjQyxHQUNqQ0MsS0FBS0gsS0FBT0EsRUFDWkcsS0FBS0YsUUFBVUEsRUFFZkUsS0FBS0gsS0FBS0ksZUFBZ0IsRUFDMUJELEtBQUtELG9CQUFzQkEsRUFHM0JHLFNBQVNDLGlCQUNMLHFCQUNBSCxLQUFLSSx3QkFBd0JDLEtBQUtMLE9BRXRDQSxLQUFLSCxLQUFLUyxHQUFHLGtCQUFtQk4sS0FBS08sc0JBQXNCRixLQUFLTCxPQUNoRUEsS0FBS0gsS0FBS1MsR0FDTixtQkFDQU4sS0FBS1EsdUJBQXVCSCxLQUFLTCxPQUl6Q0ksMEJBSUlKLEtBQUtELG9CQUNBVSxpQkFBaUIsaUNBQ2pCQyxTQUFTQyxHQUFPQSxFQUFHQyxXQUV4QlosS0FBS0gsS0FBS2dCLGlCQUFpQkgsU0FBU0ksSUFDaENkLEtBQUtELG9CQUFvQmdCLE9BQ3JCZixLQUFLZ0IsbUJBQW1CRixPQUtwQ0csNEJBQTRCQyxHQUV4QixNQUFNQyxFQUFjbkIsS0FBS29CLGtCQUFrQkYsR0FDdkNDLEdBQWFuQixLQUFLRCxvQkFBb0JnQixPQUFPSSxHQUdyRFgsdUJBQXVCTSxHQUduQmQsS0FBS3FCLGtCQUVMLE1BQU1DLEVBQW1CcEIsU0FBU3FCLGNBQzlCLHdCQUEwQlQsRUFBV1UsR0FBSyxNQUUxQ0YsR0FBb0JBLGFBQTRCRyxhQUNoRHpCLEtBQUswQixhQUFhSixFQUFrQlIsR0FJNUNFLG1CQUFtQkYsR0FDZixNQUFNYSxFQUFZekIsU0FBUzBCLGNBQWMsT0FDekNELEVBQVVFLGFBQWEsUUFBUyxnQ0FDaEMsTUFBTUMsRUFBWTVCLFNBQVMwQixjQUFjLE9Bb0J6QyxPQWxCSUcsTUFBTUMsUUFBUWxCLEVBQVdtQixPQUFTbkIsRUFBV21CLEtBQUtDLE9BQVMsSUFDM0RKLEVBQVVLLFVBQVlyQixFQUFXbUIsS0FBSyxHQUFHRyxPQUU3Q1QsRUFBVVosT0FBT2UsUUFHS08sSUFBbEJ2QixFQUFXVSxLQUNYRyxFQUFVVyxRQUFRQyxhQUFlekIsRUFBV1UsR0FHNUNNLEVBQVUzQixpQkFBaUIsU0FBUyxLQUNoQ0gsS0FBS0gsS0FBSzJDLGlCQUFpQjFCLEVBQVdVLElBRXRDeEIsS0FBS3FCLGtCQUVMckIsS0FBSzBCLGFBQWFDLEVBQVdiLE9BRzlCYSxFQUdYRCxhQUFhQyxFQUF3QlQsR0FJakMsR0FBdUMsNkJBQW5DUyxFQUFVYyxhQUFhLFNBQ3ZCLE9BR0pkLEVBQVVFLGFBQWEsUUFBUyw2QkFDaEMsTUFBTUMsRUFBWUgsRUFBVUosY0FBYyxPQUN0Q08sSUFDQUEsRUFBVUQsYUFBYSxRQUFTLHFCQUNoQ0MsRUFBVUQsYUFBYSxrQkFBbUIsUUFDMUNDLEVBQVVZLFFBQ1ZDLFFBQVFDLElBQUksb0JBR2hCLE1BQU1DLEVBQWEzQyxTQUFTMEIsY0FBYyxVQUMxQ2lCLEVBQVdoQixhQUFhLFFBQVMsUUFDakNnQixFQUFXQyxZQUFjLE9BQ3pCLE1BQU1DLEVBQWU3QyxTQUFTMEIsY0FBYyxVQTBDNUMsR0F6Q0FtQixFQUFhbEIsYUFBYSxRQUFTLFVBQ25Da0IsRUFBYUQsWUFBYyxTQUMzQm5CLEVBQVVaLE9BQU84QixHQUNqQmxCLEVBQVVaLE9BQU9nQyxHQUVqQkYsRUFBV0csUUFBVS9CLFVBRWpCQyxFQUFVK0IsV0FBYSxnQkFDbkJsQixNQUFNQyxRQUFRZCxFQUFVZSxPQUFrQyxHQUF6QmYsRUFBVWUsS0FBS0MsT0FDaERoQixFQUFVZSxLQUFLaUIsS0FBSyxDQUNoQkMsS0FBTSxjQUNOQyxRQUFTLGVBQ1RoQixNQUFPTixHQUFXZ0IsYUFBZSxHQUNqQ08sT0FBUSxjQUdMdEIsTUFBTUMsUUFBUWQsRUFBVWUsUUFFL0JmLEVBQVVlLEtBQUssR0FBR0csTUFBUU4sR0FBV2dCLGFBQWUsVUFHbEQ5QyxLQUFLSCxLQUFLeUQsZUFBZXBDLEdBQy9CbEIsS0FBS0gsS0FBSzBELGVBRVZ2RCxLQUFLd0QsYUFBYTdCLElBRXRCb0IsRUFBYTVDLGlCQUFpQixTQUFTLEtBSW5DSCxLQUFLSCxLQUFLNEQsaUJBRU45QixFQUFVVyxRQUFRQyxhQUNsQnZDLEtBQUt3RCxhQUFhN0IsRUFBV1QsR0FHN0JTLEVBQVVmLFlBS2RlLEVBQVVXLFFBQVFDLGFBQWMsQ0FDaENJLFFBQVFDLElBQUksNkJBQStCakIsRUFBVVcsUUFBUUMsY0FDN0QsTUFBTW1CLEVBQWV4RCxTQUFTMEIsY0FBYyxVQUM1QzhCLEVBQWE3QixhQUFhLFFBQVMsVUFDbkM2QixFQUFhWixZQUFjLFNBQzNCbkIsRUFBVVosT0FBTzJDLEdBRWpCQSxFQUFhdkQsaUJBQWlCLFNBQVMsS0FFbkNILEtBQUtILEtBQUs4RCxpQkFBaUJoQyxFQUFVVyxRQUFRQyxjQUU3Q1osRUFBVWYsU0FHVlosS0FBS0YsUUFBUThELFFBQVFDLE9BQU9sQyxFQUFVVyxRQUFRQyxpQkFJdEQsT0FBT1osRUFHWDZCLGFBQWE3QixFQUF3QmIsR0FHakNhLEVBQVVFLGFBQWEsUUFBUyxnQ0FDaEMsTUFBTUMsRUFBWUgsRUFBVUosY0FBYyxPQW1CMUMsT0FsQklPLElBQ0FBLEVBQVVELGFBQWEsUUFBUyxJQUNoQ0MsRUFBVUQsYUFBYSxrQkFBbUIsU0FHdENmLFFBQ29CdUIsSUFBcEJ2QixFQUFXbUIsTUFDWEYsTUFBTUMsUUFBUWxCLEVBQVdtQixRQUV6QkgsRUFBVUssVUFBWXJCLEVBQVdtQixLQUFLLEdBQUdHLE1BR3pDcEMsS0FBS0gsS0FBS2lFLGNBQWNoRCxLQUloQ2EsRUFBVWxCLGlCQUFpQixVQUFVQyxTQUFTQyxHQUFPQSxFQUFHQyxXQUVqRGUsRUFHWE4sa0JBRUluQixTQUNLTyxpQkFBaUIsOEJBQ2pCQyxTQUFTaUIsSUFDRkEsYUFBcUJGLGFBQ3JCekIsS0FBS3dELGFBQWE3QixNQU1sQ1Asa0JBQWtCRixHQUVkLE9BQU9sQixLQUFLMEIsYUFBYTFCLEtBQUtnQixtQkFBbUJFLEdBQVlBLEsiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hbm5vdG9yaW91cy10YWhxaXEvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gY3VzdG9tIGFubm90YXRpb24gZWRpdG9yIGZvciBnZW5pemEgcHJvamVjdFxuXG5pbXBvcnQgeyBBbm5vdGF0aW9uIH0gZnJvbSBcIi4vdHlwZXMvQW5ub3RhdGlvblwiO1xuXG5jbGFzcyBUcmFuc2NyaXB0aW9uRWRpdG9yIHtcbiAgICBhbm5vO1xuXG4gICAgYW5ub3RhdGlvbkNvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG5cbiAgICBzdG9yYWdlO1xuXG4gICAgLy8gVE9ETzogQWRkIHR5cGVkZWZzIGZvciB0aGUgQW5ub3RvcmlvdXMgY2xpZW50IChhbm5vKSBhbmQgc3RvcmFnZSBwbHVnaW5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGNvbnN0cnVjdG9yKGFubm86IGFueSwgc3RvcmFnZTogYW55LCBhbm5vdGF0aW9uQ29udGFpbmVyOiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmFubm8gPSBhbm5vO1xuICAgICAgICB0aGlzLnN0b3JhZ2UgPSBzdG9yYWdlO1xuICAgICAgICAvLyBkaXNhYmxlIHRoZSBkZWZhdWx0IGFubm90b3Jpb3VzIGVkaXRvciAoaGVhZGxlc3MgbW9kZSlcbiAgICAgICAgdGhpcy5hbm5vLmRpc2FibGVFZGl0b3IgPSB0cnVlO1xuICAgICAgICB0aGlzLmFubm90YXRpb25Db250YWluZXIgPSBhbm5vdGF0aW9uQ29udGFpbmVyO1xuXG4gICAgICAgIC8vIGF0dGFjaCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIFwiYW5ub3RhdGlvbnMtbG9hZGVkXCIsXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUFubm90YXRpb25zTG9hZGVkLmJpbmQodGhpcyksXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuYW5uby5vbihcImNyZWF0ZVNlbGVjdGlvblwiLCB0aGlzLmhhbmRsZUNyZWF0ZVNlbGVjdGlvbi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5hbm5vLm9uKFxuICAgICAgICAgICAgXCJzZWxlY3RBbm5vdGF0aW9uXCIsXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVNlbGVjdEFubm90YXRpb24uYmluZCh0aGlzKSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBoYW5kbGVBbm5vdGF0aW9uc0xvYWRlZCgpIHtcbiAgICAgICAgLy8gY3VzdG9tIGV2ZW50IHRyaWdnZXJlZCBieSBzdG9yYWdlIHBsdWdpblxuXG4gICAgICAgIC8vIHJlbW92ZSBhbnkgZXhpc3RpbmcgYW5ub3RhdGlvbiBkaXNwbGF5cywgaW4gY2FzZSBvZiB1cGRhdGVcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uQ29udGFpbmVyXG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5hbm5vdGF0aW9uLWRpc3BsYXktY29udGFpbmVyXCIpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWwpID0+IGVsLnJlbW92ZSgpKTtcbiAgICAgICAgLy8gZGlzcGxheSBhbGwgY3VycmVudCBhbm5vdGF0aW9uc1xuICAgICAgICB0aGlzLmFubm8uZ2V0QW5ub3RhdGlvbnMoKS5mb3JFYWNoKChhbm5vdGF0aW9uOiBBbm5vdGF0aW9uKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFubm90YXRpb25Db250YWluZXIuYXBwZW5kKFxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRGlzcGxheUJsb2NrKGFubm90YXRpb24pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgaGFuZGxlQ3JlYXRlU2VsZWN0aW9uKHNlbGVjdGlvbjogQW5ub3RhdGlvbikge1xuICAgICAgICAvLyB3aGVuIGEgbmV3IHNlbGVjdGlvbiBpcyBtYWRlLCBpbnN0YW50aWF0ZSBhbiBlZGl0b3JcbiAgICAgICAgY29uc3QgZWRpdG9yQmxvY2sgPSB0aGlzLmNyZWF0ZUVkaXRvckJsb2NrKHNlbGVjdGlvbik7XG4gICAgICAgIGlmIChlZGl0b3JCbG9jaykgdGhpcy5hbm5vdGF0aW9uQ29udGFpbmVyLmFwcGVuZChlZGl0b3JCbG9jayk7XG4gICAgfVxuXG4gICAgaGFuZGxlU2VsZWN0QW5ub3RhdGlvbihhbm5vdGF0aW9uOiBBbm5vdGF0aW9uKSB7XG4gICAgICAgIC8vIFRoZSB1c2VyIGhhcyBzZWxlY3RlZCBhbiBleGlzdGluZyBhbm5vdGF0aW9uXG4gICAgICAgIC8vIG1ha2Ugc3VyZSBubyBvdGhlciBlZGl0b3IgaXMgYWN0aXZlXG4gICAgICAgIHRoaXMubWFrZUFsbFJlYWRPbmx5KCk7XG4gICAgICAgIC8vIGZpbmQgdGhlIGRpc3BsYXkgZWxlbWVudCBieSBhbm5vdGF0aW9uIGlkIGFuZCBzd2l0aCB0byBlZGl0IG1vZGVcbiAgICAgICAgY29uc3QgZGlzcGxheUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnW2RhdGEtYW5ub3RhdGlvbi1pZD1cIicgKyBhbm5vdGF0aW9uLmlkICsgJ1wiXScsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChkaXNwbGF5Q29udGFpbmVyICYmIGRpc3BsYXlDb250YWluZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5tYWtlRWRpdGFibGUoZGlzcGxheUNvbnRhaW5lciwgYW5ub3RhdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjcmVhdGVEaXNwbGF5QmxvY2soYW5ub3RhdGlvbjogQW5ub3RhdGlvbik6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiYW5ub3RhdGlvbi1kaXNwbGF5LWNvbnRhaW5lclwiKTtcbiAgICAgICAgY29uc3QgdGV4dElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhbm5vdGF0aW9uLmJvZHkpICYmIGFubm90YXRpb24uYm9keS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0ZXh0SW5wdXQuaW5uZXJIVE1MID0gYW5ub3RhdGlvbi5ib2R5WzBdLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmQodGV4dElucHV0KTtcblxuICAgICAgICAvLyBleGlzdGluZyBhbm5vdGF0aW9uXG4gICAgICAgIGlmIChhbm5vdGF0aW9uLmlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5kYXRhc2V0LmFubm90YXRpb25JZCA9IGFubm90YXRpb24uaWQ7XG5cbiAgICAgICAgICAgIC8vIHdoZW4gdGhpcyBkaXNwbGF5IGlzIGNsaWNrZWQsIGhpZ2hsaWdodCB0aGUgem9uZSBhbmQgbWFrZSBlZGl0YWJsZVxuICAgICAgICAgICAgdGV4dElucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vLnNlbGVjdEFubm90YXRpb24oYW5ub3RhdGlvbi5pZCk7XG4gICAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIG5vIG90aGVyIGVkaXRvcnMgYXJlIGFjdGl2ZVxuICAgICAgICAgICAgICAgIHRoaXMubWFrZUFsbFJlYWRPbmx5KCk7XG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0aW9uIGV2ZW50IG5vdCBmaXJlZCBpbiB0aGlzIGNhc2UsIHNvIG1ha2UgZWRpdGFibGVcbiAgICAgICAgICAgICAgICB0aGlzLm1ha2VFZGl0YWJsZShjb250YWluZXIsIGFubm90YXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBtYWtlRWRpdGFibGUoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgc2VsZWN0aW9uOiBBbm5vdGF0aW9uKSB7XG4gICAgICAgIC8vIG1ha2UgYW4gZXhpc3RpbmcgZGlzcGxheSBjb250YWluZXIgZWRpdGFibGVcblxuICAgICAgICAvLyBpZiBpdCdzIGFscmVhZHkgZWRpdGFibGUsIGRvbid0IGRvIGFueXRoaW5nXG4gICAgICAgIGlmIChjb250YWluZXIuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgPT0gXCJhbm5vdGF0aW9uLWVkaXQtY29udGFpbmVyXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImFubm90YXRpb24tZWRpdC1jb250YWluZXJcIik7XG4gICAgICAgIGNvbnN0IHRleHRJbnB1dCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiZGl2XCIpO1xuICAgICAgICBpZiAodGV4dElucHV0KSB7XG4gICAgICAgICAgICB0ZXh0SW5wdXQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJhbm5vdGF0aW9uLWVkaXRvclwiKTtcbiAgICAgICAgICAgIHRleHRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJjb250ZW50ZWRpdGFibGVcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgdGV4dElucHV0LmZvY3VzKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRleHRpbnB1dCBmb2N1c1wiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgc2F2ZSBhbmQgY2FuY2VsIGJ1dHRvbnNcbiAgICAgICAgY29uc3Qgc2F2ZUJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIHNhdmVCdXR0b24uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJzYXZlXCIpO1xuICAgICAgICBzYXZlQnV0dG9uLnRleHRDb250ZW50ID0gXCJTYXZlXCI7XG4gICAgICAgIGNvbnN0IGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIGNhbmNlbEJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImNhbmNlbFwiKTtcbiAgICAgICAgY2FuY2VsQnV0dG9uLnRleHRDb250ZW50ID0gXCJDYW5jZWxcIjtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZChzYXZlQnV0dG9uKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZChjYW5jZWxCdXR0b24pO1xuXG4gICAgICAgIHNhdmVCdXR0b24ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIC8vIGFkZCB0aGUgY29udGVudCB0byB0aGUgYW5ub3RhdGlvblxuICAgICAgICAgICAgc2VsZWN0aW9uLm1vdGl2YXRpb24gPSBcInN1cHBsZW1lbnRpbmdcIjtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGlvbi5ib2R5KSAmJiBzZWxlY3Rpb24uYm9keS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbi5ib2R5LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlRleHR1YWxCb2R5XCIsXG4gICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6IFwidHJhbnNjcmliaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0ZXh0SW5wdXQ/LnRleHRDb250ZW50IHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJ0ZXh0L2h0bWxcIixcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogdHJhbnNjcmlwdGlvbiBtb3RpdmF0aW9uLCBsYW5ndWFnZSwgZXRjLlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGlvbi5ib2R5KSkge1xuICAgICAgICAgICAgICAgIC8vIGFzc3VtZSB0ZXh0IGNvbnRlbnQgaXMgZmlyc3QgYm9keSBlbGVtZW50XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uLmJvZHlbMF0udmFsdWUgPSB0ZXh0SW5wdXQ/LnRleHRDb250ZW50IHx8IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB1cGRhdGUgd2l0aCBhbm5vdG9yaW91cywgdGhlbiBzYXZlIHRvIHN0b3JhZ2UgYmFja2VuZFxuICAgICAgICAgICAgYXdhaXQgdGhpcy5hbm5vLnVwZGF0ZVNlbGVjdGVkKHNlbGVjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmFubm8uc2F2ZVNlbGVjdGVkKCk7XG4gICAgICAgICAgICAvLyBtYWtlIHRoZSBlZGl0b3IgaW5hY3RpdmVcbiAgICAgICAgICAgIHRoaXMubWFrZVJlYWRPbmx5KGNvbnRhaW5lcik7XG4gICAgICAgIH07XG4gICAgICAgIGNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gY2FuY2VsIHRoZSBlZGl0XG5cbiAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBzZWxlY3Rpb24gZnJvbSB0aGUgaW1hZ2VcbiAgICAgICAgICAgIHRoaXMuYW5uby5jYW5jZWxTZWxlY3RlZCgpO1xuICAgICAgICAgICAgLy8gaWYgYW5ub3RhdGlvbiBpcyB1bnNhdmVkLCByZXN0b3JlIGFuZCBtYWtlIHJlYWQgb25seVxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lci5kYXRhc2V0LmFubm90YXRpb25JZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFrZVJlYWRPbmx5KGNvbnRhaW5lciwgc2VsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGlzIHdhcyBhIG5ldyBhbm5vdGF0aW9uLCByZW1vdmUgdGhlIGNvbnRhaW5lclxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGlmIHRoaXMgaXMgYSBzYXZlZCBhbm5vdGF0aW9uLCBhZGQgZGVsZXRlIGJ1dHRvblxuICAgICAgICBpZiAoY29udGFpbmVyLmRhdGFzZXQuYW5ub3RhdGlvbklkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1ha2VFZGl0YWJsZSBleGlzdGluZyBhbm5vXCIgKyBjb250YWluZXIuZGF0YXNldC5hbm5vdGF0aW9uSWQpO1xuICAgICAgICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImRlbGV0ZVwiKTtcbiAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi50ZXh0Q29udGVudCA9IFwiRGVsZXRlXCI7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGRlbGV0ZUJ1dHRvbik7XG5cbiAgICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgaGlnaGxpZ2h0IHpvbmUgZnJvbSB0aGUgaW1hZ2VcbiAgICAgICAgICAgICAgICB0aGlzLmFubm8ucmVtb3ZlQW5ub3RhdGlvbihjb250YWluZXIuZGF0YXNldC5hbm5vdGF0aW9uSWQpO1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgZWRpdC9kaXNwbGF5IGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAvLyBjYWxsaW5nIHJlbW92ZUFubm90YXRpb24gZG9lc24ndCBmaXJlIHRoZSBkZWxldGVBbm5vdGF0aW9uLFxuICAgICAgICAgICAgICAgIC8vIHNvIHdlIGhhdmUgdG8gdHJpZ2dlciB0aGUgZGVsZXRpb24gZXhwbGljaXRseVxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmFnZS5hZGFwdGVyLmRlbGV0ZShjb250YWluZXIuZGF0YXNldC5hbm5vdGF0aW9uSWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xuICAgIH1cblxuICAgIG1ha2VSZWFkT25seShjb250YWluZXI6IEhUTUxFbGVtZW50LCBhbm5vdGF0aW9uPzogQW5ub3RhdGlvbikge1xuICAgICAgICAvLyBjb252ZXJ0IGEgY29udGFpbmVyIHRoYXQgaGFzIGJlZW4gbWFkZSBlZGl0YWJsZSBiYWNrIHRvIGRpc3BsYXkgZm9ybWF0XG4gICAgICAgIC8vIGFubm90YXRpb24gaXMgb3B0aW9uYWw7IHVzZWQgdG8gcmVzZXQgY29udGVudCBpZiBuZWNlc3NhcnlcbiAgICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiYW5ub3RhdGlvbi1kaXNwbGF5LWNvbnRhaW5lclwiKTtcbiAgICAgICAgY29uc3QgdGV4dElucHV0ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCJkaXZcIik7XG4gICAgICAgIGlmICh0ZXh0SW5wdXQpIHtcbiAgICAgICAgICAgIHRleHRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcIlwiKTtcbiAgICAgICAgICAgIHRleHRJbnB1dC5zZXRBdHRyaWJ1dGUoXCJjb250ZW50ZWRpdGFibGVcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgICAgIC8vIHJlc3RvcmUgdGhlIG9yaWdpbmFsIGNvbnRlbnRcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBhbm5vdGF0aW9uICYmXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbi5ib2R5ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICBBcnJheS5pc0FycmF5KGFubm90YXRpb24uYm9keSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRleHRJbnB1dC5pbm5lckhUTUwgPSBhbm5vdGF0aW9uLmJvZHlbMF0udmFsdWU7XG4gICAgICAgICAgICAgICAgLy8gYWRkIHRoZSBhbm5vdGF0aW9uIGFnYWluIHRvIHVwZGF0ZSB0aGUgaW1hZ2Ugc2VsZWN0aW9uIHJlZ2lvbixcbiAgICAgICAgICAgICAgICAvLyBpbiBjYXNlIHRoZSB1c2VyIGhhcyBtb2RpZmllZCBpdCBhbmQgd2FudHMgdG8gY2FuY2VsXG4gICAgICAgICAgICAgICAgdGhpcy5hbm5vLmFkZEFubm90YXRpb24oYW5ub3RhdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVtb3ZlIGJ1dHRvbnMgKG9yIHNob3VsZCB3ZSBqdXN0IGhpZGUgdGhlbT8pXG4gICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiYnV0dG9uXCIpLmZvckVhY2goKGVsKSA9PiBlbC5yZW1vdmUoKSk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBtYWtlQWxsUmVhZE9ubHkoKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSBubyBlZGl0b3IgaXMgYWN0aXZlXG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5hbm5vdGF0aW9uLWVkaXQtY29udGFpbmVyXCIpXG4gICAgICAgICAgICAuZm9yRWFjaCgoY29udGFpbmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1ha2VSZWFkT25seShjb250YWluZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gbWV0aG9kIHRvIGNyZWF0ZSBhbiBlZGl0b3IgYmxvY2tcbiAgICAvLyBjb250YWluZXIsIGVkaXRhYmxlIGRpdiwgYnV0dG9ucyB0byBzYXZlL2NhbmNlbC9kZWxldGVcbiAgICBjcmVhdGVFZGl0b3JCbG9jayhzZWxlY3Rpb246IEFubm90YXRpb24pIHtcbiAgICAgICAgLy8gY3JlYXRlIGEgbmV3IGFubm90YXRpb24gZWRpdG9yIGJsb2NrIGFuZCByZXR1cm5cbiAgICAgICAgcmV0dXJuIHRoaXMubWFrZUVkaXRhYmxlKHRoaXMuY3JlYXRlRGlzcGxheUJsb2NrKHNlbGVjdGlvbiksIHNlbGVjdGlvbik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFuc2NyaXB0aW9uRWRpdG9yO1xuIl0sIm5hbWVzIjpbImNvbnN0cnVjdG9yIiwiYW5ubyIsInN0b3JhZ2UiLCJhbm5vdGF0aW9uQ29udGFpbmVyIiwidGhpcyIsImRpc2FibGVFZGl0b3IiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJoYW5kbGVBbm5vdGF0aW9uc0xvYWRlZCIsImJpbmQiLCJvbiIsImhhbmRsZUNyZWF0ZVNlbGVjdGlvbiIsImhhbmRsZVNlbGVjdEFubm90YXRpb24iLCJxdWVyeVNlbGVjdG9yQWxsIiwiZm9yRWFjaCIsImVsIiwicmVtb3ZlIiwiZ2V0QW5ub3RhdGlvbnMiLCJhbm5vdGF0aW9uIiwiYXBwZW5kIiwiY3JlYXRlRGlzcGxheUJsb2NrIiwiYXN5bmMiLCJzZWxlY3Rpb24iLCJlZGl0b3JCbG9jayIsImNyZWF0ZUVkaXRvckJsb2NrIiwibWFrZUFsbFJlYWRPbmx5IiwiZGlzcGxheUNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJpZCIsIkhUTUxFbGVtZW50IiwibWFrZUVkaXRhYmxlIiwiY29udGFpbmVyIiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsInRleHRJbnB1dCIsIkFycmF5IiwiaXNBcnJheSIsImJvZHkiLCJsZW5ndGgiLCJpbm5lckhUTUwiLCJ2YWx1ZSIsInVuZGVmaW5lZCIsImRhdGFzZXQiLCJhbm5vdGF0aW9uSWQiLCJzZWxlY3RBbm5vdGF0aW9uIiwiZ2V0QXR0cmlidXRlIiwiZm9jdXMiLCJjb25zb2xlIiwibG9nIiwic2F2ZUJ1dHRvbiIsInRleHRDb250ZW50IiwiY2FuY2VsQnV0dG9uIiwib25jbGljayIsIm1vdGl2YXRpb24iLCJwdXNoIiwidHlwZSIsInB1cnBvc2UiLCJmb3JtYXQiLCJ1cGRhdGVTZWxlY3RlZCIsInNhdmVTZWxlY3RlZCIsIm1ha2VSZWFkT25seSIsImNhbmNlbFNlbGVjdGVkIiwiZGVsZXRlQnV0dG9uIiwicmVtb3ZlQW5ub3RhdGlvbiIsImFkYXB0ZXIiLCJkZWxldGUiLCJhZGRBbm5vdGF0aW9uIl0sInNvdXJjZVJvb3QiOiIifQ==