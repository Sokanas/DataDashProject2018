var powerbi;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){function t(e,t,n){void 0===e&&(e=[]);var r=e;return i(r),t&&(r.identityFields=t),n&&(r.source=n),r}function i(e,t){e.grouped=t?function(){return t}:function(){return n(e)}}function n(e){for(var t,i=[],n=0,r=e.length;r>n;n++){var a=e[n];if(!t||t.identity!==a.identity){if(t={values:[]},a.identity){t.identity=a.identity;var o=a.source;void 0!==o.groupName?t.name=o.groupName:o.displayName&&(t.name=o.displayName)}i.push(t)}t.values.push(a)}return i}e.createValueColumns=t,e.setGrouped=i,e.groupValues=n}(t=e.DataViewTransform||(e.DataViewTransform={}))}(t=e.dataview||(e.dataview={}))}(t=e.utils||(e.utils={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var powerbi;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){function t(e,t){if(!e||!e.length)return-1;var i=e[0];if(i.values&&i.values.length>0)for(var r=0,a=i.values.length;a>r;++r){var o=i.values[r];if(o&&o.source&&n(o.source,t))return r}return-1}function i(e,t){if(e&&e.length)for(var i=0,r=e.length;r>i;i++)if(n(e[i].source,t))return i;return-1}function n(e,t){var i=e.roles;return i&&i[t]}function r(e,t){return null!=e&&null!=e.metadata&&e.metadata.columns&&e.metadata.columns.some(function(e){return e.roles&&void 0!==e.roles[t]})}function a(e,t){return e&&e.source&&e.source.roles&&e.source.roles[t]===!0}e.getMeasureIndexOfRole=t,e.getCategoryIndexOfRole=i,e.hasRole=n,e.hasRoleInDataView=r,e.hasRoleInValueColumn=a}(t=e.DataRoleHelper||(e.DataRoleHelper={}))}(t=e.dataview||(e.dataview={}))}(t=e.utils||(e.utils={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var powerbi;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){function t(e,t,i){if(!e)return i;var n=e[t];return void 0===n?i:n}function i(e,i,n){var r=t(e,i);return r&&r.solid?r.solid.color:n}e.getValue=t,e.getFillColorByPropertyName=i}(t=e.DataViewObject||(e.DataViewObject={}))}(t=e.dataview||(e.dataview={}))}(t=e.utils||(e.utils={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var powerbi;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){var t;!function(t){function i(t,i,n){return t?e.DataViewObject.getValue(t[i.objectName],i.propertyName,n):n}function n(e,t,i){return e&&e[t]?e[t]:i}function r(e,t,n){var r=i(e,t);return r&&r.solid?r.solid.color:n}function a(e,t,n){var r=i(e,t,n);return r&&r.solid?r.solid.color:void 0===r||null===r||"object"==typeof r&&!r.solid?n:r}t.getValue=i,t.getObject=n,t.getFillColor=r,t.getCommonValue=a}(t=e.DataViewObjects||(e.DataViewObjects={}))}(t=e.dataview||(e.dataview={}))}(t=e.utils||(e.utils={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var powerbi;!function(e){var t;!function(t){var i;!function(t){var i;!function(t){var i,n=e.extensibility.utils.dataview.DataRoleHelper;!function(e){function t(e,t,i){if(e.categories&&e.categories.length>0){var r=e.categories[0];return r.source&&n.hasRole(r.source,t)&&n.hasRole(r.source,i)}return!1}function i(e){return void 0!==e.groupName?e.groupName:e.queryName}function r(e){var t=o(e);return null!=t&&t.imageUrl===!0}function a(e){var t=o(e);return null!=t&&t.webUrl===!0}function o(e){return e&&e.type&&e.type.misc}function s(e){return e&&e.metadata&&e.metadata.columns&&e.metadata.columns.length?e.metadata.columns.some(function(e){return r(e)===!0}):!1}e.categoryIsAlsoSeriesRole=t,e.getSeriesName=i,e.isImageUrlColumn=r,e.isWebUrlColumn=a,e.getMiscellaneousTypeDescriptor=o,e.hasImageUrlColumn=s}(i=t.converterHelper||(t.converterHelper={}))}(i=t.dataview||(t.dataview={}))}(i=t.utils||(t.utils={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var powerbi;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){var t=function(){function t(){}return t.getDefault=function(){return new this},t.createPropertyIdentifier=function(e,t){return{objectName:e,propertyName:t}},t.parse=function(t){var i,n=this.getDefault();if(!t||!t.metadata||!t.metadata.objects)return n;i=n.getProperties();for(var r in i)for(var a in i[r]){var o=n[r][a];n[r][a]=e.DataViewObjects.getCommonValue(t.metadata.objects,i[r][a],o)}return n},t.isPropertyEnumerable=function(e){return!t.InnumerablePropertyPrefix.test(e)},t.enumerateObjectInstances=function(e,t){var i=e&&e[t.objectName];if(!i)return[];var n={objectName:t.objectName,selector:null,properties:{}};for(var r in i)i.hasOwnProperty(r)&&(n.properties[r]=i[r]);return{instances:[n]}},t.prototype.getProperties=function(){var e=this,i={},n=Object.keys(this);return n.forEach(function(n){if(t.isPropertyEnumerable(n)){var r=Object.keys(e[n]);i[n]={},r.forEach(function(e){t.isPropertyEnumerable(n)&&(i[n][e]=t.createPropertyIdentifier(n,e))})}}),i},t}();t.InnumerablePropertyPrefix=/^_/,e.DataViewObjectsParser=t}(t=e.dataview||(e.dataview={}))}(t=e.utils||(e.utils={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var __extends=this&&this.__extends||function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var i in t)t.hasOwnProperty(i)&&(e[i]=t[i])};return function(t,i){function n(){this.constructor=t}e(t,i),t.prototype=null===i?Object.create(i):(n.prototype=i.prototype,new n)}}(),powerbi;!function(e){var t;!function(e){var t;!function(e){var t;!function(e){"use strict";function t(){o=0}function i(){return 0===o}function n(e,t){var i=[];if(e&&e.hasChildNodes()){for(var n=e.children,a=0;a<n.length;a++){var o=void 0;o="script"===n.item(a).nodeName.toLowerCase()?r(n.item(a)):n.item(a).cloneNode(!0),t.appendChild(o),i.push(o)}return i}}function r(e){for(var t=document.createElement("script"),i=e.attributes,n=0;n<i.length;n++)t.setAttribute(i[n].name,i[n].textContent),"src"===i[n].name.toLowerCase()&&(o++,t.onload=function(){o--});return t.innerHTML=e.innerHTML,t}function a(){var e=window.setInterval(function(){i()&&(window.clearInterval(e),window.hasOwnProperty("HTMLWidgets")&&window.HTMLWidgets.staticRender&&window.HTMLWidgets.staticRender())},100)}var o=0;e.ResetInjector=t,e.injectorReady=i,e.ParseElement=n,e.RunHTMLWidgetRenderer=a}(t=e.barChart499A0A12A57F413881C384AA9A1840CB||(e.barChart499A0A12A57F413881C384AA9A1840CB={}))}(t=e.visual||(e.visual={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var powerbi;!function(e){var t;!function(t){var i;!function(t){var i;!function(t){"use strict";var i=e.extensibility.utils.dataview.DataViewObjectsParser,n=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.ColourSettings=new r,t.Settings=new a,t}return __extends(t,e),t}(i);t.VisualSettings=n;var r=function(){function e(){this.show=!0,this.fill="#FD625E",this.thresholdActive=!1,this.threshold1=40,this.colour1="#F2C80F",this.threshold2=70,this.colour2="#01B8AA"}return e}();t.ColourSettings=r;var a=function(){function e(){this.fill="#FD625E",this.legendActive=!0,this.sliderActive=!0,this.outlieractive=!1}return e}();t.Settings=a}(i=t.barChart499A0A12A57F413881C384AA9A1840CB||(t.barChart499A0A12A57F413881C384AA9A1840CB={}))}(i=t.visual||(t.visual={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var powerbi;!function(e){var t;!function(t){var i;!function(t){var i;!function(t){"use strict";var i=!1,n=[e.VisualUpdateType.Resize,e.VisualUpdateType.ResizeEnd,e.VisualUpdateType.Resize+e.VisualUpdateType.ResizeEnd],r=function(){function e(e){e&&e.element&&(this.rootElement=e.element),this.headNodes=[],this.bodyNodes=[]}return e.prototype.update=function(t){if(t&&t.type&&t.viewport&&t.dataViews&&0!==t.dataViews.length&&t.dataViews[0]){var i=t.dataViews[0];this.settings=e.parseSettings(i);var r=null;i.scriptResult&&i.scriptResult.payloadBase64&&(r=i.scriptResult.payloadBase64),-1===n.indexOf(t.type)?r&&this.injectCodeFromPayload(r):this.onResizing(t.viewport)}},e.prototype.onResizing=function(e){},e.prototype.injectCodeFromPayload=function(e){if(t.ResetInjector(),e){var n=document.createElement("html");try{n.innerHTML=window.atob(e)}catch(r){return}if(i||0===this.headNodes.length){for(;this.headNodes.length>0;){var a=this.headNodes.pop();document.head.removeChild(a)}var o=n.getElementsByTagName("head");if(o&&o.length>0){var s=o[0];this.headNodes=t.ParseElement(s,document.head)}}for(;this.bodyNodes.length>0;){var a=this.bodyNodes.pop();this.rootElement.removeChild(a)}var u=n.getElementsByTagName("body");if(u&&u.length>0){var l=u[0];this.bodyNodes=t.ParseElement(l,this.rootElement)}t.RunHTMLWidgetRenderer()}},e.parseSettings=function(e){return t.VisualSettings.parse(e)},e.prototype.enumerateObjectInstances=function(e){return t.VisualSettings.enumerateObjectInstances(this.settings||t.VisualSettings.getDefault(),e)},e}();t.Visual=r}(i=t.barChart499A0A12A57F413881C384AA9A1840CB||(t.barChart499A0A12A57F413881C384AA9A1840CB={}))}(i=t.visual||(t.visual={}))}(t=e.extensibility||(e.extensibility={}))}(powerbi||(powerbi={}));var powerbi;!function(e){var t;!function(t){var i;!function(t){t.barChart499A0A12A57F413881C384AA9A1840CB={name:"barChart499A0A12A57F413881C384AA9A1840CB",displayName:"BarChart","class":"Visual",version:"1.0.0",apiVersion:"1.11.0",create:function(t){return new e.extensibility.visual.barChart499A0A12A57F413881C384AA9A1840CB.Visual(t)},custom:!0}}(i=t.plugins||(t.plugins={}))}(t=e.visuals||(e.visuals={}))}(powerbi||(powerbi={}));