self.importScripts(`/emcJS/worker/scripts/PortHandler.js`);

self.PortHandler.addEventListener("message", (event) => {
    const port = event.port;
    self.PortHandler.sendAllButOne(port, event.data);
});
