// The React.JS code for the download method:

const download = (nodes, edges, filename) => {
  const data = {
    nodes: nodes,
    edges: edges,
  };
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const upload = (event) => {
  return new Promise((resolve, reject) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      // console.log("upload", data);
      resolve({
        nodes: data.nodes,
        edges: data.edges,
      });
    };
    reader.onerror = () => {
      reject(reader.error);
    };
  });
};

const downloadApi = (nodes, edges, filename) => {
  // const url = "http://localhost:8080/api/v1/download";
  const url = "http://164.90.144.35:8080/api/v1/download";
  const data = {
    nodes: nodes,
    edges: edges,
  };
  filename = filename.replace(".json", "");
  const body = {
    fileName: filename,
    flowContent: data,
  };
  const json = JSON.stringify(body);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/plain",
    },
    body: json,
  })
    .then((response) => response.text())

    .then((data) => {
      console.log(data);
      window.open(`${url}/${data}?fileName=${filename}`, "_blank");
    });
};

export default {
  download: download,
  upload: upload,
  downloadApi: downloadApi,
};
