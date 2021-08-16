import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
} from 'react-router-dom';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

let config = {
  headers: {
    Authorization:
      'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwUGFINU55VXRxTUkzMDZtajdZVHdHV3JIZE81cWxmaCIsImlhdCI6MTYyMDY2Mjk4NjIwM30.lhfzSXW9_TC67SdDKyDbMOYiYsKuSk6bG6XDE1wz2OL4Tq0Og9NbLMhb0LUtmrgzfWiTrqAFfnPldd8QzWvgVQ',
  },
};

function App() {
  const [datos, setDatos] = useState();

  useEffect(() => {
    axios
      .get('https://eshop-deve.herokuapp.com/api/v2/orders', config)
      .then((res) => {
        setDatos(res.data.orders);
      });
  }, []);

  return (
    <Router>
      <div className='App'>
        <Switch>
          <Route path='/' exact>
            {datos ? (
              <ListaDeOrdenes ordenes={datos} />
            ) : (
              console.log('Cargando datos..')
            )}
          </Route>
          <Route path='/detalle'>
            <ListaDeProductos />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

const ListaDeOrdenes = ({ ordenes }) => {
  console.log(ordenes);
  return (
    <div>
      <h1>Órdenes de Compra</h1>
      <ul className='ul-ordenes'>
        {ordenes.map((orden) => (
          <Link
            to={{
              pathname: '/detalle',
              state: { numeroOrden: orden.number, productos: orden.items },
            }}
            key={orden.number}
          >
            <li className='li-orden'>
              <span>{`No. Orden: ${orden.number}`}</span>
              <span>{`Total: ${orden.totals.total}`}</span>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

const ListaDeProductos = () => {
  const [productosCreados, setProductosCreados] = useState([]);
  const location = useLocation();
  const { numeroOrden, productos } = location.state;
  console.log(productos);
  const modalAgregarProducto = withReactContent(Swal);

  const agregarProducto = () => {
    modalAgregarProducto
      .fire({
        title: <p>Agregar Producto</p>,
        html: `<ul id="formulario">
              <li><label for="sku">SKU</label><input type="text" id="sku" class="swal2-input"></li>
              <li><label for="nombreProducto">Nombre del producto</label><input type="text" id="nombreProducto" class="swal2-input"></li>
              <li><label for="cantidad">Cantidad</label><input type="number" min="1" id="cantidad" class="swal2-input"></li>
              <li><label for="precio">Precio</label><input type="number" min="1" id="precio" class="swal2-input"></li>
            </ul>`,
        confirmButtonText: 'Agregar',
        confirmButtonColor: '#9b85ac',
        preConfirm: () => {
          const sku = Swal.getPopup().querySelector('#sku').value;
          const nombreProducto =
            Swal.getPopup().querySelector('#nombreProducto').value;
          const cantidad = Swal.getPopup().querySelector('#cantidad').value;
          const precio = Swal.getPopup().querySelector('#precio').value;
          if (!sku || !nombreProducto || !cantidad || !precio) {
            Swal.showValidationMessage('Por favor llene todos los campos.');
          }
          return { sku, nombreProducto, cantidad, precio };
        },
      })
      .then((result) => {
        if (result.value) {
          setProductosCreados([...productosCreados, { datos: result.value }]);
        }
      });
  };

  const alertaPagoExitoso = () => {
    Swal.fire({
      icon: 'success',
      title: '¡Gracias!',
      text: 'El pago se realizó correctamente.',
      confirmButtonColor: '#6eaa6e',
    });
  };

  return (
    <div>
      <h1>Detalle de la Orden #{numeroOrden}</h1>
      <ul className='ul-productos'>
        {productos.map((producto) => (
          <li className='li-producto' key={producto.id}>
            <span>{`SKU: ${producto.sku}`}</span>
            <span>{`Nombre: ${producto.name}`}</span>
            <span>{`Cant: ${producto.quantity}`}</span>
            <span>{`Precio: ${producto.price}`}</span>
          </li>
        ))}
        {productosCreados.map((producto) => (
          <Producto
            key={producto.datos.sku}
            sku={producto.datos.sku}
            nombreProducto={producto.datos.nombreProducto}
            cantidad={producto.datos.cantidad}
            precio={producto.datos.precio}
          />
        ))}
      </ul>
      <div id='seccionBtn'>
        <button id='btnAgregar' className='btn' onClick={agregarProducto}>
          Agregar Producto
        </button>
        <button id='btnPagar' className='btn' onClick={alertaPagoExitoso}>
          Pagar
        </button>
      </div>
    </div>
  );
};

const Producto = ({ sku, nombreProducto, cantidad, precio }) => {
  return (
    <li className='li-producto'>
      <span>{`SKU: ${sku}`}</span>
      <span>{`Nombre: ${nombreProducto}`}</span>
      <span>{`Cant: ${cantidad}`}</span>
      <span>{`Precio: ${precio}`}</span>
    </li>
  );
};
export default App;
