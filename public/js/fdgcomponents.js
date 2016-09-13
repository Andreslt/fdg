$(document).ready(function(){
   $('.view-ticket').on('click', function(){
            $('#edit-ticket-id').val($(this).data('id'));
            $('#edit-ticket-number').val($(this).data('number'));
            $('#edit-ticket-title').val($(this).data('title'));
            $('#edit-ticket-description').val($(this).data('description'));
            $('#edit-ticket-store').val($(this).data('store'));
            $('#edit-ticket-city').val($(this).data('city'));
   });
    $('#submitModal').on('click', ()=>{
        console.log("Se cerró");
    });
});