// PRELOADER
function preloaderHide() {
    const preloader = document.querySelector('#preloader');

    // Cuando pasen 1200ms se agregara la clase hide al preloader
    setTimeout(() => {
        preloader.classList.add('hide');
    }, 1500);

}

// VALIDACION DE FORMULARIO BOOTSTRAP
(() => {
    'use strict'

    const forms = document.querySelectorAll('.needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

// FILTRADO POR SEXO
let listaTrabajadores = [];

async function cargarTrabajadores() {
    const res = await fetch('/Trabajadores/ObtenerTrabajadores');
    listaTrabajadores = await res.json(); // guardamos todos

    actualizarTabla(); // renderizar según filtro actual
}

function actualizarTabla() {
    const filtro = document.getElementById('filtroSexo').value;
    const tbodyTrabajadores = document.getElementById('listarTrabajadores');
    tbodyTrabajadores.innerHTML = '';

    const filtrados = filtro ? listaTrabajadores.filter(t => t.sexo === filtro) : listaTrabajadores;

    filtrados.forEach(t => {
        const colorClase = t.sexo === 'M' ? 'bg-men text-white fw-bold' : 'bg-women text-white fw-bold';

        const fila = `
            <tr data-id="${t.id}" class="${colorClase}">
                <td>${t.tipoDocumento}</td>
                <td>${t.numeroDocumento}</td>
                <td>${t.nombres}</td>
                <td>${t.sexo}</td>
                <td>${t.departamento}</td>
                <td>${t.provincia}</td>
                <td>${t.distrito}</td>
                <td>
                    <button class="btnEditar btn btn-edit btn-sm" data-id="${t.id}"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
                    <button class="btnEliminar btn btn-delete btn-sm" data-id="${t.id}"><i class="fa-solid fa-trash"></i> Eliminar</button>
                </td>
            </tr>
        `;
        tbodyTrabajadores.insertAdjacentHTML('beforeend', fila);
    });
}

// UNA VEZ QUE CARGA TODO EL DOCUMENTO
window.addEventListener('DOMContentLoaded', () => {
    //PRELOADER
    preloaderHide();

    // OBTENER TRABAJADORES
    cargarTrabajadores();

    // AL CAMBIAR EL SELECT FILTRO POR SEXO
    document.getElementById('filtroSexo').addEventListener('change', actualizarTabla);

    // OBTENER DEPARTAMENTOS DESDE LA RUTA CREADA EN EL CONTROLADOR
    $.get('/Trabajadores/ObtenerDepartamentos', function (data) {
        $('#selectDepartamento').empty().append('<option value="">-- Seleccione --</option>');
        data.forEach(dep => {
            $('#selectDepartamento').append(`<option value="${dep.id}">${dep.nombreDepartamento}</option>`);
        });
    });

    $('#selectProvincia').empty().append('<option value="">-- Seleccione --</option>');
    $('#selectDistrito').empty().append('<option value="">-- Seleccione --</option>');

    // AL SELECCIONAR UN DEPA SE HARA LA CONSULTA DE PROVINCIAS DE ACUERDO AL ID DEPA
    $('#selectDepartamento').on('change', function () {
        const idDepartamento = $(this).val();
        $('#selectProvincia').empty().append('<option value="">-- Cargando... --</option>');
        $('#selectDistrito').empty().append('<option value="">-- Seleccione --</option>');

        $.get('/Trabajadores/ObtenerProvincias', { idDepartamento }, function (data) {
            $('#selectProvincia').empty().append('<option value="">-- Seleccione --</option>');
            data.forEach(p => {
                $('#selectProvincia').append(`<option value="${p.id}">${p.nombreProvincia}</option>`);
            });
        });
    });

    // AL SELECCIONAR UNA PROVINCIA SE HARA LA CONSULTA DE DISTRITOS DE ACUERDO AL ID PROVINCIA
    $('#selectProvincia').on('change', function () {
        const idProvincia = $(this).val();
        $('#selectDistrito').empty().append('<option value="">-- Cargando... --</option>');

        $.get('/Trabajadores/ObtenerDistritos', { idProvincia }, function (data) {
            $('#selectDistrito').empty().append('<option value="">-- Seleccione --</option>');
            data.forEach(d => {
                $('#selectDistrito').append(`<option value="${d.id}">${d.nombreDistrito}</option>`);
            });
        });
    });

    // REINICIAR MODAL AL CERRARLO
    $('#modalTrabajadores').on('hidden.bs.modal', function () {
        $('#formTrabajador')[0].reset();
        $('#selectDepartamento').empty().append('<option value="">-- Seleccione --</option>');
        $('#selectProvincia').empty().append('<option value="">-- Seleccione --</option>');
        $('#selectDistrito').empty().append('<option value="">-- Seleccione --</option>');
        $('#selectDepartamento').val('');
        $('#formTrabajador').removeClass('was-validated');
        $('#modalTrabajadorTitle').text('Registrar Trabajador');
        $('#formTrabajador').attr('action', '/Trabajadores/Create');
        $('#formTrabajador').find('#Id').remove();
    });
});

// MODAL EDITAR TRABAJADOR - LLENAR DATOS DE ACUERDO AL ID DE TRABAJADOR
$(document).on('click', '.btnEditar', function() {
    const id = $(this).data('id');

    const modalBody = $('.modal-body');
    // COMO ESTAMOS EN MODO EDITAR SE AGREGA INPUT DE MODO HIDDEN PARA TENER EL ID DEL TRABAJADOR
    modalBody.append('<input type="hidden" id="Id" name="Id" />')
   
    const formTrabajador = $("#formTrabajador");
    formTrabajador[0].reset();
    // CAMBIAMOS EL ACTION Y LE PONEMOS LA RUTA EDIT
    formTrabajador.attr('action', '/Trabajadores/Edit');
    $('#modalTrabajadorTitle').text('Editar Trabajador');

    // OBTENEMOS EL TRABAJADOR DE ACUERDO AL ID
    $.get('/Trabajadores/ObtenerPorId', { id }, function (data) {
        if (!data) {
            alert("Trabajador no encontrado!");
            return;
        }

        // ASIGNAMOS VALORES A LOS CAMPOS
        $('#Id').val(data.id);
        $('#Nombres').val(data.nombres);
        $('#NumeroDocumento').val(data.numeroDocumento);
        $('#TipoDocumento').val(data.tipoDocumento);
        $(`input[name="Sexo"][value="${data.sexo}"]`).prop('checked', true);

        // LLENAMOS LOS SELECTS DE ACUERDO A LOS ID OBTENIDOS DE LA CONSULTA
        $.get('/Trabajadores/ObtenerDepartamentos', function (dep) {
            $('#selectDepartamento').empty().append('<option value="">-- Seleccione --</option>');
            dep.forEach(d => {
                $('#selectDepartamento').append(`<option value="${d.id}">${d.nombreDepartamento}</option>`);
            });

            $('#selectDepartamento').val(data.idDepartamento);

            // Provincias
            $.get('/Trabajadores/ObtenerProvincias', { idDepartamento: data.idDepartamento }, function (prov) {
                $('#selectProvincia').empty().append('<option value="">-- Seleccione --</option>');
                prov.forEach(p => {
                    $('#selectProvincia').append(`<option value="${p.id}">${p.nombreProvincia}</option>`);
                });

                $('#selectProvincia').val(data.idProvincia);

                // Distritos
                $.get('/Trabajadores/ObtenerDistritos', { idProvincia: data.idProvincia }, function (dis) {
                    $('#selectDistrito').empty().append('<option value="">-- Seleccione --</option>');
                    dis.forEach(d => {
                        $('#selectDistrito').append(`<option value="${d.id}">${d.nombreDistrito}</option>`);
                    });

                    $('#selectDistrito').val(data.idDistrito);
                });
            });
        });
    });

    // ABRIMOS EL MODAL
    const modal = new bootstrap.Modal(document.getElementById('modalTrabajadores'));
    modal.show();
});


// UNA VEZ AGREGADO O ACTUALIZADO
$('#formTrabajador').on('submit', function (e) {
    e.preventDefault();

    const form = this;
    const $form = $(this);

    if (!form.checkValidity()) {
        e.stopPropagation();
        $form.addClass('was-validated');
        return;
    }

    const formData = $form.serialize();

    const id = $('#Id').val();
    const nuevoT = (!id || id === '' || id === "0");

    const url = nuevoT ? '/Trabajadores/Create' : '/Trabajadores/Edit';

    $.ajax({
        url: url,
        method: 'POST',
        data: formData,
        success: function () {
            Swal.fire({
                icon: "success",
                title: nuevoT ? "Registro" : 'Actualizado',
                text: nuevoT ? "Se agrego el trabajador correctamente!" : 'Se actualizo el trabajador correctamente!'
            });

            const modal = bootstrap.Modal.getInstance(document.getElementById('modalTrabajadores'));
            modal.hide();

            form.reset();
            $('#Id').val('');
            $form.removeClass('was-validated');

            cargarTrabajadores();
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Error al guardar',
                text: 'Revisa los datos e intenta nuevamente.'
            });
        }
    });
});

// ELIMINAR
$(document).on('click', '.btnEliminar', async function () {
    const id = $(this).data('id');

    const result = await Swal.fire({
        title: "Eliminar",
        text: "¿Seguro que quieres eliminar el trabajador?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si!"
    });

    if (result.isConfirmed) {

        const res = await fetch('/Trabajadores/Eliminar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${id}`
        });

        const respuesta = await res.json();
        console.log(respuesta);
        if (respuesta.success) {
            Swal.fire({
                title: "Eliminado!",
                text: "El trabajador ha sido eliminado.",
                icon: "success"
            });

            cargarTrabajadores();
        } else {
            Swal.fire({
                title: "Error!",
                text: "No se pudo eliminar al trabajador.",
                icon: "error"
            });
        }
    }
});