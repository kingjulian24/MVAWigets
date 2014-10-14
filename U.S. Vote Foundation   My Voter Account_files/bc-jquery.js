jQuery(function($) {
  // Used on personal details section of main mva form
	if (jQuery('.accordion').length > 0){
		jQuery('.accordion').each(function(index2){
          jQuery(this).find('input').each(function(index){
             var current = $(this);
             fieldValue = current.val();
             if (fieldValue){ return false; }
      });

			if (!fieldValue) {
				jQuery(this).accordion({collapsible: true, autoHeight: false, icons: false, active: true});
				 }
			else {
				jQuery(this).accordion({collapsible: true, autoHeight: false, icons: false});
			}
		});
  }

  if (jQuery('.form-type')){
      jQuery('.form-type input').click(function(){
         var formType = $(this).val();
                console.log(formType);
      });

       //$form.attr('action', 'new url').submit();
  }




 /*
    //honeypot
 $("form[name='eodForm']").submit(function() {
   if ($("input[name='automated']").val()){
		  alert("Automated Submission Detected, Please try again");
		  return true;
	  } else{
      $this.submit();
   }
});
*/

 });