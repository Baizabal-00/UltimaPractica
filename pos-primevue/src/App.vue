<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

const toast = useToast()
const confirm = useConfirm()

const IVA = 0.16

// ---------- Datos ----------
const productos = ref([
  { cns: 1, nombre: 'Impresora LaserJet Color', precio: 5200, cantidad: 2 },
  { cns: 2, nombre: 'Monitor LED 31 plg.', precio: 1700, cantidad: 3 }
])

// ---------- Formulario de registro ----------
const nuevo = ref({ nombre: '', cantidad: null, precio: null })

function registrar() {
  const { nombre, cantidad, precio } = nuevo.value
  if (!nombre.trim() || !cantidad || cantidad <= 0 || precio === null || precio <= 0) {
    toast.add({
      severity: 'warn',
      summary: 'Datos incompletos',
      detail: 'Captura nombre, cantidad y precio (mayores a cero).',
      life: 3000
    })
    return
  }

  productos.value.push({
    cns: productos.value.length + 1,
    nombre: nombre.trim(),
    cantidad,
    precio
  })

  toast.add({ severity: 'success', summary: 'Registrado', detail: `${nombre} agregado a la venta`, life: 2500 })
  nuevo.value = { nombre: '', cantidad: null, precio: null }
}

// ---------- Editar ----------
const dialogVisible = ref(false)
const editado = ref({})

function abrirEditar(producto) {
  editado.value = { ...producto }
  dialogVisible.value = true
}

function guardarEdicion() {
  const { nombre, cantidad, precio } = editado.value
  if (!nombre?.trim() || !cantidad || cantidad <= 0 || precio === null || precio <= 0) {
    toast.add({ severity: 'warn', summary: 'Datos inválidos', detail: 'Revisa los campos.', life: 3000 })
    return
  }
  const i = productos.value.findIndex(p => p.cns === editado.value.cns)
  if (i !== -1) {
    productos.value[i] = { ...editado.value, nombre: nombre.trim() }
  }
  dialogVisible.value = false
  toast.add({ severity: 'info', summary: 'Actualizado', detail: 'Producto modificado', life: 2500 })
}

// ---------- Eliminar ----------
function eliminar(producto) {
  confirm.require({
    message: `¿Eliminar "${producto.nombre}" de la venta?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Eliminar', severity: 'danger' },
    accept: () => {
      productos.value = productos.value
        .filter(p => p.cns !== producto.cns)
        .map((p, i) => ({ ...p, cns: i + 1 })) // renumera el consecutivo
      toast.add({ severity: 'error', summary: 'Eliminado', detail: `${producto.nombre} eliminado`, life: 2500 })
    }
  })
}

// ---------- Cálculos ----------
const precioParcial = p => p.precio * p.cantidad

const subtotal = computed(() =>
  productos.value.reduce((suma, p) => suma + precioParcial(p), 0)
)
const iva = computed(() => subtotal.value * IVA)
const total = computed(() => subtotal.value + iva.value)

// ---------- Formato moneda ----------
const formatoMoneda = valor =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor)
</script>

<template>
  <Toast />
  <ConfirmDialog />

  <div class="pos-wrapper">
    <div class="pos-card">
      <div class="pos-header">PUNTO DE VENTA (POS)</div>

      <div class="pos-body">
        <!-- Formulario de registro -->
        <div class="pos-form">
          <InputText v-model="nuevo.nombre" placeholder="Nombre del producto..." @keyup.enter="registrar" />
          <InputNumber v-model="nuevo.cantidad" placeholder="Cant" :min="1" :useGrouping="false" />
          <InputNumber
            v-model="nuevo.precio"
            placeholder="$ Precio U."
            mode="currency"
            currency="MXN"
            locale="es-MX"
            :min="0"
          />
          <Button label="Registrar" icon="pi pi-plus" severity="success" class="btn-registrar" @click="registrar" />
        </div>

        <!-- Tabla de productos -->
        <DataTable
          :value="productos"
          dataKey="cns"
          paginator
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Visualizando {last} de {totalRecords} productos"
          stripedRows
          showGridlines
          tableStyle="min-width: 50rem"
        >
          <template #empty>No hay productos registrados.</template>

          <Column field="cns" header="Cns" sortable style="width: 8%" />
          <Column field="nombre" header="Nombre del Producto" sortable />
          <Column field="precio" header="Precio U." style="width: 14%">
            <template #body="{ data }">{{ formatoMoneda(data.precio) }}</template>
          </Column>
          <Column field="cantidad" header="Cant." style="width: 9%; text-align: center" />
          <Column header="Precio P." style="width: 14%">
            <template #body="{ data }">{{ formatoMoneda(precioParcial(data)) }}</template>
          </Column>
          <Column header="Acciones" style="width: 12%">
            <template #body="{ data }">
              <div class="acciones">
                <Button icon="pi pi-pencil" severity="success" aria-label="Editar" @click="abrirEditar(data)" />
                <Button icon="pi pi-trash" severity="danger" aria-label="Eliminar" @click="eliminar(data)" />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- Totales -->
        <div class="pos-totales">
          <label for="subtotal">Subtotal:</label>
          <InputText id="subtotal" :value="formatoMoneda(subtotal)" readonly />
          <label for="iva">IVA (16%):</label>
          <InputText id="iva" :value="formatoMoneda(iva)" readonly />
          <label for="total">Total:</label>
          <InputText id="total" :value="formatoMoneda(total)" readonly />
        </div>
      </div>
    </div>
  </div>

  <!-- Diálogo de edición -->
  <Dialog v-model:visible="dialogVisible" header="Editar producto" modal :style="{ width: '28rem' }">
    <div class="dialog-campos">
      <div class="campo">
        <label for="ed-nombre">Nombre del producto</label>
        <InputText id="ed-nombre" v-model="editado.nombre" />
      </div>
      <div class="campo">
        <label for="ed-cant">Cantidad</label>
        <InputNumber inputId="ed-cant" v-model="editado.cantidad" :min="1" :useGrouping="false" />
      </div>
      <div class="campo">
        <label for="ed-precio">Precio unitario</label>
        <InputNumber inputId="ed-precio" v-model="editado.precio" mode="currency" currency="MXN" locale="es-MX" :min="0" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined @click="dialogVisible = false" />
      <Button label="Guardar" icon="pi pi-check" @click="guardarEdicion" />
    </template>
  </Dialog>
</template>
