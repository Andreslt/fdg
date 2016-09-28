$(document).ready(function(){
   $('.view-ticket').on('click', function(){
            $('#edit-ticket-id').val($(this).data('id'));
            $('#edit-ticket-number').val($(this).data('number'));
            $('#edit-ticket-title').val($(this).data('title'));
            $('#edit-ticket-description').val($(this).data('description'));
            $('#edit-ticket-store').val($(this).data('store'));
            $('#edit-ticket-city').val($(this).data('city'));
            $('#edit-ticket-status').val($(this).data('status'));
            $('#openningDate').val($(this).data('openning'));
            $('#lastUpdate').val($(this).data('lastupdate'));
   });

/*   $('selectCompany').on('click',function(){
       console.log("Entró");
       return $(this).text() == "EPK";       
   }).prop('selected', true);*/

    $("select#selectCompany option").each(function() { 
        this.selected = (this.text == userCompany); 
    });

    $("select#selectStore option").each(function() { 
        this.selected = (this.text == userStore); 
    });

    $("select#selectCity option").each(function() { 
        this.selected = (this.text == userCity); 
    });

});