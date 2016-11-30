$(document).ready(function () {
    $('.view-ticket').on('click', function () {
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

    $('.edit-store').on('click', function () {
        $('#edit-store-id').val($(this).data('id'));
        $('#edit-store-name').val($(this).data('name'));
        $('#edit-store-address').val($(this).data('address'));
        $('#edit-store-phone').val($(this).data('phone'));
        $('#edit-store-email').val($(this).data('email'));
        $('#edit-store-startdate').val($(this).data('startdate'));
        var storeRep = $(this).data('representative');
        var storeCity = $(this).data('city');
        $("#edit-store-representative").val(storeRep).trigger("change");
        $("#edit-store-city").val(storeCity).trigger("change");
        var employeesInStore = new Array();
        employeesInStore = $(this).data('users').split(",{ _id");
        var tableHeader, tableContent, tableFooter;
        for (let i = 0; i < employeesInStore.length; i++) {
            if (i != 0) {
                employeesInStore[i] = "id" + employeesInStore[i];
            }
        }

        /*            var employeesJSON = JSON.stringify(employeesInStore);
                    console.log(employeesJSON);*/

        /*            eval('var obj='+employeesInStore);
                    console.log(obj);*/

        // console.log(employeesInStore);

        for (let i = 0; i < employeesInStore.length; i++) {
            let employeeARRAY = employeesInStore[i].split(',');
            for (let j = 0; j < employeeARRAY.length; j++) {
                var tup = employeeARRAY[j].split(':');
                /*                    var username,name,lastname, city;
                                    if (tup[0]==='username')
                                        username=tup[0];
                                    else if (tup[0]==='name')
                                        name=tup[0];
                                    else if (tup[0]==='lastname')
                                        lastname=tup[0];   
                                    else if (tup[0]==='city_id')
                                        city=tup[2];                                                                        
                                    tableContent = '<tr role="row" class="odd"><td class="sorting_1">'+username+'</td><td class=" expand"><span class="responsiveExpander"></span>'+name+" "+lastname+'</td><td>'+city+'</td></tr>'
                                    console.log(tableContent);*/
                let key = tup[0].toString(), val = tup[1].toString(), city = tup[2].toString();
                if ('username'.localeCompare(key)) {
                    console.log('key: ' + key);
                    console.log('val: ' + val);
                    console.log('city: ' + city);
                    console.log('tupla: ' + tup);
                    console.log("-------------------");
                }
            }
            console.log("-------------------");
            console.log("-------------------");
        }


        tableHeader = '<tr role="row"><th data-hide="username" class="sorting_asc" tabindex="0" aria-controls="dt_basic" rowspan="1" colspan="1" aria-sort="ascending" aria-label="Username: activate to sort column descending" style="width: 0px;">Username</th><th data-class="expand" class="expand sorting" tabindex="0" aria-controls="dt_basic" rowspan="1" colspan="1" aria-label=" Nombre: activate to sort column ascending" style="width: 0px;"><i class="fa fa-fw fa-user text-muted hidden-md hidden-sm hidden-xs"></i> Nombre</th><th data-hide="city" class="sorting" tabindex="0" aria-controls="dt_basic" rowspan="1" colspan="1" aria-label=" Ciudad: activate to sort column ascending" style="width: 0px;"><i class="fa fa-fw fa-phone text-muted hidden-md hidden-sm hidden-xs"></i> Ciudad</th></tr>'
        /*            employeesInStore.forEach((employee)=>{
                        employee
                        console.log(user.)
                    })*/
        tableContent = '<tr role="row" class="odd"><td class="sorting_1">EPK_Empleado</td><td class=" expand"><span class="responsiveExpander"></span>Andres Lastra Terán</td><td>Cartagena</td></tr>'


        //alert(document.getElementById("dt_basic").innerHTML) //= tableHeader + tableContent + tableFooter;                     
    });

    $('.edit-employee').on('click', function () {
        $('#edit-employee-id').val($(this).data('id'));
        $('#edit-employee-username').val($(this).data('username'))
        $('#edit-employee-name').val($(this).data('name'));
        $('#edit-employee-lastname').val($(this).data('lastname'));
        $('#edit-employee-phone').val($(this).data('phone'));
        $('#edit-employee-localId').val($(this).data('localid'));
        $('#edit-employee-email').val($(this).data('email'));
        $('#edit-employee-position').val($(this).data('position'));
        $('#edit-employee-approvedOn').val($(this).data('approvedon'));
        $('#edit-employee-createdOn').val($(this).data('createdon'));
        var store_id = $(this).data('storeid');
        var position = $(this).data('position');
        console.log(position);
        $('#edit-employee-store_id').val(store_id).trigger("change");
        $('#edit-employee-position').val(position).trigger("change");
    });

    $('input.disablecopypaste').bind('copy paste', function (e) {
        e.preventDefault();
    });

    $('.deleteticket_button').on('click', function () {
        $('#delete_ticket_id').val($(this).data('ticketid'));
    });

    $('#textValidation').on('input', function (e) {
        var entry = $(this).val(),
            valid = tktnumber.slice(-5);
        console.log(entry);
        if (entry === valid)
            $('.deleteticket_button').removeClass('deleteticket_button').addClass('deleteticket_button2');
        else
            $('.deleteticket_button2').removeClass('deleteticket_button2').addClass('deleteticket_button');
    });

    $("select#selectCompany option").each(function () {
        this.selected = (this.text == userCompany);
    });

    $("select#selectStore option").each(function () {
        this.selected = (this.text == userStore);
    });

    $("select#selectCity option").each(function () {
        this.selected = (this.text == userCity);
    });

    $("#setadvance option").each(function () {
        this.selected = (this.value === tktadvance.toString());
    });

    $("#setstatus").val(tktstatus.toString())

    $("#setpriority").val(tktpriority.toString())

    $("select#store_city option").each(function () {
        this.selected = (this.value === storeCity);
    });

    $("select#store_representative option").each(function () {
        this.selected = (this.value === storeRep);
    });

    $("#delete-store-id").val(storeID)

    /*SPINNERS*/
    //Power
    $('#ref_power_up').on('click', function () {
        var value = $('#ref_power').val();
        $('#ref_power').val(spin_up(value))
    });

    $('#ref_power_down').on('click', function () {
        var value = $('#ref_power').val();
        $('#ref_power').val(spin_down(value))
    });

    //Dimensions
    $('#ref_height_up').on('click', function () {
        var value = $('#ref_height').val();
        $('#ref_height').val(spin_up(value))
    });

    $('#ref_height_down').on('click', function () {
        var value = $('#ref_height').val();
        $('#ref_height').val(spin_down(value))
    });

    $('#ref_width_up').on('click', function () {
        var value = $('#ref_width').val();
        $('#ref_width').val(spin_up(value))
    });

    $('#ref_width_down').on('click', function () {
        var value = $('#ref_width').val();
        $('#ref_width').val(spin_down(value))
    });

    $('#ref_large_up').on('click', function () {
        var value = $('#ref_large').val();
        $('#ref_large').val(spin_up(value))
    });

    $('#ref_large_down').on('click', function () {
        var value = $('#ref_large').val();
        $('#ref_large').val(spin_down(value))
    });

    //Capacity
    $('#ref_capacity_up').on('click', function () {
        var value = $('#ref_capacity').val();
        $('#ref_capacity').val(spin_up(value))
    });

    $('#ref_capacity_down').on('click', function () {
        var value = $('#ref_capacity').val();
        $('#ref_capacity').val(spin_down(value))
    });

    //Weight
    $('#ref_weight_up').on('click', function () {
        var value = $('#ref_weight').val();
        $('#ref_weight').val(spin_up(value))
    });

    $('#ref_weight_down').on('click', function () {
        var value = $('#ref_weight').val();
        $('#ref_weight').val(spin_down(value))
    });

    $('select#store_id').on('change', function () {

        $.ajax({
            url: '/assets/getlocalnum/'+$('select#store_id').val(),
            type: 'POST',
            success: function (response) {
                $('#asset_localcode').val(parseInt(response)+1);
            }
        })
        
    });

    function spin_up(value) {
        var newvalue = Math.floor(parseFloat(value) * 100) + 10;
        return (newvalue / 100).toFixed(1)
    }

    function spin_down(value) {
        var newvalue = Math.floor(parseFloat(value) * 100) - 10;
        return (newvalue / 100).toFixed(1)
    }

    $("#storeEmp").prop('checked', storeEmp);
    $("#storeAdmin").prop('checked', storeAdmin);
});