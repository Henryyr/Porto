document.addEventListener("DOMContentLoaded", function () {
  let dataTable;
  let revenueByCategoryChart;
  let revenueByMonthChart;
  let revenueByLocationChart;
  let revenueByProductDetailChart;
  let originalData;

  fetchData();

  function fetchData() {
    fetch("transactions.json")
      .then((response) => response.json())
      .then((data) => {
        originalData = data;
        initializeDataTables(data);
        initializeCharts(data);
      })
      .catch((error) =>
        console.error("Error fetching transactions data:", error)
      );
  }

  function initializeDataTables(data) {
    dataTable = $("#transaction-table-dt").DataTable({
      data: data,
      columns: [
        { data: "product_category", title: "Product Category" },
        { data: "product_detail", title: "Product Detail" },
        { data: "unit_price", title: "Price" },
        { data: "transaction_qty", title: "Total Sales" },
        { data: "transaction_date", title: "Transaction Date" },
      ],
    });
    $("#transaction-table-dt").show();
    $("#loading-transaction-table").hide();
  }

  function initializeCharts(data) {
    const revenueByCategoryData = processRevenueByCategoryData(data);
    const revenueByMonthData = processRevenueByMonthData(data);
    const revenueByLocationData = processRevenueByLocationData(data);
    const revenueByProductDetailData = processRevenueByProductDetailData(data);

    initializeChart(
      "revenue-by-category-chart",
      "bar",
      revenueByCategoryData,
      {
        scales: { y: { beginAtZero: true } },
      }
    );
    $("#revenue-by-category-chart").show();
    $("#loading-category-chart").hide();

    initializeChart("revenue-by-month-chart", "line", revenueByMonthData, {
      scales: { y: { beginAtZero: true } },
    });
    $("#revenue-by-month-chart").show();
    $("#loading-month-chart").hide();

    initializeChart(
      "revenue-by-location-chart",
      "pie",
      revenueByLocationData,
      { responsive: true }
    );
    $("#revenue-by-location-chart").show();
    $("#loading-location-chart").hide();

    initializeChart(
      "revenue-by-product-detail-chart",
      "bar",
      revenueByProductDetailData,
      {
        indexAxis: "y",
        scales: { y: { beginAtZero: true } },
      }
    );
    $("#revenue-by-product-detail-chart").show();
    $("#loading-product-detail-chart").hide();
  }

  function initializeChart(elementId, type, data, options) {
    const ctx = document.getElementById(elementId).getContext("2d");
    const chart = new Chart(ctx, {
      type: type,
      data: data,
      options: options,
    });
  }

  function updateCharts(filteredData) {
    const revenueByCategoryData = processRevenueByCategoryData(filteredData);
    const revenueByMonthData = processRevenueByMonthData(filteredData);
    const revenueByLocationData = processRevenueByLocationData(filteredData);
    const revenueByProductDetailData = processRevenueByProductDetailData(
      filteredData
    );

    updateChart(revenueByCategoryChart, revenueByCategoryData);
    updateChart(revenueByMonthChart, revenueByMonthData);
    updateChart(revenueByLocationChart, revenueByLocationData);
    updateChart(revenueByProductDetailChart, revenueByProductDetailData);
  }

  function updateChart(chart, newData) {
    chart.data = newData;
    chart.update();
  }

  function filterData() {
    let filteredData = [...originalData];

    const selectedCategory = $("#product-category-select").val();
    const selectedLocation = $("#store-location-select").val();
    const selectedMonth = $("#transaction-month-select").val();

    if (selectedCategory !== "all") {
      filteredData = filteredData.filter(
        (item) => item.product_category === selectedCategory
      );
    }

    if (selectedLocation !== "all") {
      filteredData = filteredData.filter(
        (item) => item.store_location === selectedLocation
      );
    }

    if (selectedMonth !== "all") {
      const selectedMonthIndex = parseInt(selectedMonth.split("-")[1]);
      filteredData = filteredData.filter((item) => {
        const transactionMonth =
          new Date(item.transaction_date).getMonth() + 1;
        return transactionMonth === selectedMonthIndex;
      });
    }

    dataTable.clear().rows.add(filteredData).draw();
    updateCharts(filteredData);
  }

  $("#product-category-select").change(filterData);
  $("#store-location-select").change(filterData);
  $("#transaction-month-select").change(filterData);

  function processRevenueByCategoryData(data) {
    const categoryRevenue = {};
    data.forEach((transaction) => {
      const category = transaction.product_category;
      const revenue = transaction.unit_price * transaction.transaction_qty;
      categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue;
    });

    const sortedCategories = Object.keys(categoryRevenue).sort(
      (a, b) => categoryRevenue[b] - categoryRevenue[a]
    );

    return {
      labels: sortedCategories,
      datasets: [
        {
          label: "Revenue",
          data: sortedCategories.map(
            (category) => categoryRevenue[category]
          ),
          backgroundColor: sortedCategories.map(getRandomColor),
          borderColor: sortedCategories.map(getRandomColor),
          borderWidth: 1,
        },
      ],
    };
  }

  function processRevenueByMonthData(data) {
    const monthRevenue = {};
    data.forEach((transaction) => {
      const month = new Date(transaction.transaction_date).toLocaleString("default", { month: "long" });
      const revenue = transaction.unit_price * transaction.transaction_qty;
      monthRevenue[month] = (monthRevenue[month] || 0) + revenue;
    });

    const sortedMonths = ["January", "February", "March", "April", "May", "June"];

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Revenue",
          data: sortedMonths.map((month) => monthRevenue[month] || 0),
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    };
  }

  function processRevenueByLocationData(data) {
    const locationRevenue = {};
    data.forEach((transaction) => {
      const location = transaction.store_location;
      const revenue = transaction.unit_price * transaction.transaction_qty;
      locationRevenue[location] = (locationRevenue[location] || 0) + revenue;
    });

    return {
      labels: Object.keys(locationRevenue),
      datasets: [
        {
          label: "Revenue",
          data: Object.values(locationRevenue),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  function processRevenueByProductDetailData(data) {
    const productDetailRevenue = {};
    data.forEach((transaction) => {
      const productDetail = transaction.product_detail;
      const revenue = transaction.unit_price * transaction.transaction_qty;
      productDetailRevenue[productDetail] = (productDetailRevenue[productDetail] || 0) + revenue;
    });

    const sortedProductDetails = Object.keys(productDetailRevenue).sort(
      (a, b) => productDetailRevenue[b] - productDetailRevenue[a]
    );

    return {
      labels: sortedProductDetails,
      datasets: [
        {
          label: "Revenue",
          data: sortedProductDetails.map(
            (productDetail) => productDetailRevenue[productDetail]
          ),
          backgroundColor: sortedProductDetails.map(getRandomColor),
          borderColor: sortedProductDetails.map(getRandomColor),
          borderWidth: 1,
        },
      ],
    };
  }

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

})
