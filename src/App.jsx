import Header from "./components/Header";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import "./App.css";

import Sidebar from "./components/Sidebar";
import Inicio from "./pages/Inicio";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";
import Pagos from "./pages/Pagos";
import Caja from "./pages/Caja";
import Cuentas from "./pages/Cuentas";
import Morosos from "./pages/Morosos";
import Cobros from "./pages/Cobros";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

import { storage } from "./services/storage";

function App() {
  const [pantalla, setPantalla] =
    useState("inicio");

  const [clientes, setClientes] = useState(
    () => storage.clientes.obtener()
  );

  const [pedidos, setPedidos] = useState(
    () => storage.pedidos.obtener()
  );

  const [pagos, setPagos] = useState(
    () => storage.pagos.obtener()
  );

  const [negocio, setNegocio] = useState(
    () => storage.negocio.obtener()
  );

  const [sistema, setSistema] = useState(
    () => storage.sistema.obtener()
  );

  const [clientePedido, setClientePedido] =
    useState("");

  const [clientePago, setClientePago] =
    useState("");

  useEffect(() => {
    storage.clientes.guardar(clientes);
  }, [clientes]);

  useEffect(() => {
    storage.pedidos.guardar(pedidos);
  }, [pedidos]);

  useEffect(() => {
    storage.pagos.guardar(pagos);
  }, [pagos]);

  useEffect(() => {
    storage.negocio.guardar(negocio);
  }, [negocio]);

  useEffect(() => {
    storage.sistema.guardar(sistema);
  }, [sistema]);

  const limpiarClientePedido = useCallback(
    () => setClientePedido(""),
    []
  );

  const limpiarClientePago = useCallback(
    () => setClientePago(""),
    []
  );

  function irPedido(clienteId) {
    setClientePedido(clienteId);
    setPantalla("pedidos");
  }

  function irPago(clienteId) {
    setClientePago(clienteId);
    setPantalla("pagos");
  }

  const propiedades = {
    clientes,
    setClientes,
    pedidos,
    setPedidos,
    pagos,
    setPagos,
    negocio,
    setNegocio,
    sistema,
    setSistema,
  };

  function mostrarPantalla() {
    switch (pantalla) {
      case "clientes":
        return (
          <Clientes
            {...propiedades}
            onIrPedidos={irPedido}
            onIrPagos={irPago}
          />
        );

      case "pedidos":
        return (
          <Pedidos
            {...propiedades}
            clienteInicial={clientePedido}
            limpiarClienteInicial={
              limpiarClientePedido
            }
          />
        );

      case "pagos":
        return (
          <Pagos
            {...propiedades}
            clienteInicial={clientePago}
            limpiarClienteInicial={
              limpiarClientePago
            }
          />
        );

      case "caja":
        return <Caja {...propiedades} />;

      case "cuentas":
        return <Cuentas {...propiedades} />;

      case "morosos":
        return <Morosos {...propiedades} />;

      case "cobros":
        return <Cobros {...propiedades} />;

      case "reportes":
        return <Reportes {...propiedades} />;

      case "configuracion":
        return (
          <Configuracion
            negocio={negocio}
            setNegocio={setNegocio}
            sistema={sistema}
            setSistema={setSistema}
          />
        );

      default:
        return (
          <Inicio
            {...propiedades}
            onIr={setPantalla}
          />
        );
    }
  }

return (
  <div className="layout">
    <Sidebar
      pantalla={pantalla}
      onCambiar={setPantalla}
      negocio={negocio}
      sistema={sistema}
    />

    <main className="main-area">
      <Header
        pantalla={pantalla}
        negocio={negocio}
      />

      <div className="content">
        {mostrarPantalla()}
      </div>
    </main>
  </div>
);
}

export default App;