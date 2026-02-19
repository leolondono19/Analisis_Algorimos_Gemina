// Description: This file contains the functions to download and upload an array file for the sorting problem
const downloadArray = (array, filename) => {
  const data = {
    array: array,
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

const uploadArray = (event) => {
  return new Promise((resolve, reject) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      // console.log("upload", data);
      resolve({
        array: data.array,
      });
    };
    reader.onerror = () => {
      reject(reader.error);
    };
  });
};

const downloadArrayApi = (array, filename) => {
  // const url = "http://localhost:8080/api/v1/download";
  const url = "http://164.90.144.35:8080/api/v1/download";
  const data = {
    array: array,
  };
  filename = filename.replace(".json", "");
  const body = {
    fileName: filename,
    arrayContent: data,
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
  downloadArray,
  uploadArray,
  downloadArrayApi,
};
