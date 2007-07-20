//Recorder Functionality
//*********************************/
windmill.ui.recorder = new function () {
     var recordState = false;

     this.setRecState = function(){
       if (this.recordState == true){
         this.recordOn();
       }
     }
     //write json to the remote from the click events
     this.writeJsonClicks = function(e){
         if( this.recordState == false){ return; }
         
         var locator = '';
         var locValue = '';
         if (e.target.id != ""){
            locator = 'id';
            locValue = e.target.id;
         }
         else if (e.target.name != ""){
            locator = 'name';
            locValue = e.target.name;
         }
         else if (e.target.innerHTML.match('href') != 'null'){
            locator = 'link';
            locValue = e.target.innerHTML.replace(/(<([^>]+)>)/ig,"");
            locValue = locValue.replace("\n", "");
         }
         else{
             locator = 'Couldnt Detect';
             locValue = 'Couldnt Detect';
         } 
         if (locValue != ""){
            var params = {};
            params[locator] = locValue;
            
            if(e.type == 'dblclick'){
                windmill.ui.remote.addAction(windmill.ui.remote.buildAction('doubleClick', params));
            }
            else{
                 //console.log(e.target.parentNode);                 
                 if (windmill.remote.$("clickOn").checked == true){
                     windmill.ui.remote.addAction(windmill.ui.remote.buildAction('click', params));
                 }
                 else if ((e.target.onclick != null) || (locator == 'link') || (e.target.type == 'image')){
                    windmill.ui.remote.addAction(windmill.ui.remote.buildAction('click', params));
                }
          }
        }
         windmill.ui.remote.scrollRecorderTextArea();

     }
     
     //Writing json to the remote for the change events
     this.writeJsonChange = function(e){          

           if( this.recordState == false){ return; }
           var locator = '';
           var locValue = '';
           if (e.target.id != ""){
              locator = 'id';
              locValue = e.target.id;
           }
           else if (e.target.name != ""){
              locator = 'name';
              locValue = e.target.nodeName;
           }
           else{
            locator = 'Couldnt Detect';
            locValue = 'Couldnt Detect';
           }
          
          var params = {};
          params[locator] = locValue;

          if (e.target.type == 'textarea'){
              params['text'] = e.target.value;
              windmill.ui.remote.addAction(windmill.ui.remote.buildAction('type', params));

          }
          else if (e.target.type == 'text'){
              params['text'] = e.target.value;
              windmill.ui.remote.addAction(windmill.ui.remote.buildAction('type', params));
          }
          else if (e.target.type == 'password'){
              params['text'] = e.target.value;
              windmill.ui.remote.addAction(windmill.ui.remote.buildAction('type', params));
          }
          else if(e.target.type == 'select-one'){
              params['option'] = e.target.value;
              windmill.ui.remote.addAction(windmill.ui.remote.buildAction('select', params));   
          }
          else if(e.target.type == 'radio'){
              windmill.ui.remote.addAction(windmill.ui.remote.buildAction('radio', params));
          }
          else if(e.target.type == "checkbox"){
              windmill.ui.remote.addAction(windmill.ui.remote.buildAction('check', params));    
          }
          
          windmill.ui.remote.scrollRecorderTextArea();

      }
      
      //Turn on the recorder
     //Since the click event does things like firing twice when a double click goes also
     //and can be obnoxious im enabling it to be turned off and on with a toggle check box
     this.recordOn = function(){
        
         //Turn off the listeners so that we don't have multiple attached listeners for the same event
         this.recordOff();
         //keep track of the recorder state, for page refreshes
         this.recordState = true;
         windmill.ui.remote.getSuite();
         
         //IE's onChange support doesn't bubble so we have to manually
         //Attach a listener to every select and input in the app
         if (windmill.browser.isIE != false){
           var inp = windmill.testingApp.document.getElementsByTagName('input');
           for (var i = 0; i < inp.length; i++) { 
              fleegix.event.listen(inp[i], 'onchange', this, 'writeJsonChange');
           }
           var se = windmill.testingApp.document.getElementsByTagName('select');
           for (var i = 0; i < se.length; i++) { 
              fleegix.event.listen(se[i], 'onchange', this, 'writeJsonChange');
           }
         }
         
         fleegix.event.listen(windmill.testingApp.document, 'ondblclick', this, 'writeJsonClicks');
         fleegix.event.listen(windmill.testingApp.document, 'onchange', this, 'writeJsonChange');
         //fleegix.event.listen(windmill.testingApp.document, 'onblur', this, 'writeJsonChange');
         fleegix.event.listen(windmill.testingApp.document, 'onclick', this, 'writeJsonClicks');

         //We need to set these listeners on all iframes inside the testing app, per bug 32
         var iframeCount = windmill.testingApp.window.frames.length;
         var iframeArray = windmill.testingApp.window.frames;
         
         for (var i=0;i<iframeCount;i++)
         {
             try{
                 fleegix.event.listen(iframeArray[i], 'ondblclick', this, 'writeJsonClicks');
                 fleegix.event.listen(iframeArray[i], 'onchange', this, 'writeJsonChange');
                 fleegix.event.listen(iframeArray[i], 'onclick', this, 'writeJsonClicks');
                 //fleegix.event.listen(iframeArray[i], 'onblur', this, 'writeJsonChange');

            }
            catch(error){             
                this.writeResult('There was a problem binding to one of your iframes, is it cross domain? Binding to all others.' + error);     
            }
         }
     }
     
     this.recordOff = function(){
         this.recordState = false;
         
          //IE's onChange support doesn't bubble so we have to manually
         //Attach a listener to every select and input in the app
         if (windmill.browser.isIE != false){
           var inp = windmill.testingApp.document.getElementsByTagName('input');
           for (var i = 0; i < inp.length; i++) { 
              fleegix.event.unlisten(inp[i], 'onchange', this, 'writeJsonChange');
           }
           var se = windmill.testingApp.document.getElementsByTagName('select');
           for (var i = 0; i < se.length; i++) { 
              fleegix.event.unlisten(se[i], 'onchange', this, 'writeJsonChange');
           }
         }
         fleegix.event.unlisten(windmill.testingApp.document, 'ondblclick', this, 'writeJsonClicks');
         fleegix.event.unlisten(windmill.testingApp.document, 'onchange', this, 'writeJsonChange');
         fleegix.event.unlisten(windmill.testingApp.document, 'onclick', this, 'writeJsonClicks');
         //fleegix.event.unlisten(windmill.testingApp.document, 'onblur', this, 'writeJsonChange');

         //fleegix.event.unlisten(windmill.testingApp.document, 'onmousedown', this, 'writeJsonDragDown');
         //fleegix.event.unlisten(windmill.testingApp.document, 'onmouseup', this, 'writeJsonDragUp');
         
          //We need to disable these listeners on all iframes inside the testing app, per bug 32
         var iframeCount = windmill.testingApp.window.frames.length;
         var iframeArray = windmill.testingApp.window.frames;
         
         for (var i=0;i<iframeCount;i++)
         {
            try{
               fleegix.event.unlisten(iframeArray[i], 'ondblclick', this, 'writeJsonClicks');
               fleegix.event.unlisten(iframeArray[i], 'onchange', this, 'writeJsonChange');
               fleegix.event.unlisten(iframeArray[i], 'onclick', this, 'writeJsonClicks');
               //fleegix.event.unlisten(iframeArray[i], 'onblur', this, 'writeJsonClicks');
           }
           catch(error){ 
              this.writeResult('There was a problem binding to one of your iframes, is it cross domain? Binding to all others.' + error);          
          }
         }      
     }
};
