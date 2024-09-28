(function () {
    "use strict";

    function initializeMode() {
        const is_dark = localStorage.getItem("BAYTI:THEME") === "dark";

        $("body").toggleClass("dark-mode", is_dark);
        $(".main-header").toggleClass("navbar-dark", is_dark).toggleClass("navbar-light navbar-white", !is_dark);
        $(".main-sidebar").toggleClass("sidebar-dark-primary", is_dark).toggleClass("sidebar-light-primary", !is_dark);

        $("[data-widget=mode]").html(is_dark ? "<i class='far fa-sun'></i>" : "<i class='fas fa-moon'></i>");
    }

    function initializeDatatable() {
        if (typeof $.fn.DataTable === "undefined") {
            return;
        }

        var tableDef = $("#datatable").attr("defs");

        var table = $("#datatable").DataTable({
            dom: "i",
            paging: true,
            lengthChange: true,
            searching: true,
            info: false,
            pageLength: 15,
            columnDefs: [{ searchable: false, orderable: false, targets: [+tableDef || null, -1] }],
            language: {
                search: "",
                searchPlaceholder: "بحث ...",
                lengthMenu: "_MENU_",
                zeroRecords: "لا يوجد سجلات",
                emptyTable: "لا يوجد سجلات",
                paginate: {
                    previous: "<i class='fas fa-chevron-right'></i>",
                    next: "<i class='fas fa-chevron-left'></i>"
                }
            },
            drawCallback: function () {
                const api = this.api();
                const info = api.page.info();

                const handleSearch = () => {
                    api.search("").columns().search("").draw();

                    const text = $("#datatable-search-text").val();
                    const column = $("#datatable-search-columns").val();

                    if (column === "all") {
                        api.search(text).draw();
                    } else {
                        api.column(column).search(text).draw();
                    }
                };

                $("#datatable-pages").val(info.page);
                $("#datatable-search").off("click").on("click", handleSearch);
                $("#datatable-search-text")
                    .off("search keydown")
                    .on("search", handleSearch)
                    .on("keydown", function (event) {
                        if (event.keyCode === 13) {
                            handleSearch();
                        }
                    });

                $("#datatable-info").html(`عرض ${info.start + 1} - ${info.end} من ${info.recordsTotal}`);
                $("#datatable-page").html(`الصفحة ${info.page + 1}`);
            },
            initComplete: function () {
                const api = this.api();
                const info = api.page.info();

                api.columns().every(function (index) {
                    const header = $(this.header()).text();

                    if (index != api.columns()[0].length - 1) {
                        $("#datatable-search-columns").append($("<option>").attr("value", index).text(header));
                    }
                });

                if (info.pages <= 0) {
                    $("#datatable-pages").append($("<option>").attr("value", "0").text(1));
                } else {
                    for (let i = 0; i < info.pages; i++) {
                        $("#datatable-pages").append($("<option>").attr("value", i).text(i + 1));
                    }
                }

                $("#datatable-pagination").append($(".dataTables_paginate"));

                $("#datatable-pages").off("change").on("change", function () {
                    const page = +this.value;

                    if (page >= 0) {
                        api.page(page).draw(false);
                    }
                });

                $("#datatable-result").off("change").on("change", function () {
                    const length = +this.value;

                    if (length > 0) {
                        api.page.len(length).draw();
                    }
                });

                $("#datatable-overlay").fadeOut(750);
            }
        });
    }

    function initializeComponents() {
        if (typeof $.fn.select2 !== "undefined") {
            $(".select-s").select2({
                theme: "bootstrap",
                width: "resolve",
                dir: "ltr",
                language: { noResults: () => "لا يوجد سجلات" }
            });

            $(".select-ns").select2({
                minimumResultsForSearch: -1,
                theme: "bootstrap",
                width: "resolve",
                dir: "ltr",
                language: { noResults: () => "لا يوجد سجلات" }
            });
        }

        $("[data-widget=pushmenu]").PushMenu({
            autoCollapseSize: true,
            enableRemember: true,
            noTransitionAfterReload: true
        });

        $("ul.nav-treeview a")
            .filter(function () { return $(this).hasClass("active"); })
            .parentsUntil(".nav-sidebar > .nav-treeview")
            .css({ display: "block" })
            .addClass("menu-open")
            .prev("a")
            .addClass("active");

        $(".upload-modal").on("click", function () {
            const input = $(this).find(".form-control");
            const type = $(this).data("type");
            const max = $(this).data("max");
            let init = "new";
            let files = [];
            let selected = input.val() || "";

            function toggleSelection(modal, id) {
                const fileRow = modal.find(`[data-row="${id}"] .files-select`);

                if (files.includes(id)) {
                    files = files.filter(file => file !== id);
                    fileRow.html('<i class="fas fa-expand mr-2"></i>تحديد');
                } else {
                    if (max && files.length - 1 >= +max) return;

                    files.push(id);
                    fileRow.html('<i class="fas fa-check mr-2"></i>تم التحديد');
                }

                $("#files-selected").html(files.length > 1 ? `تم تحديد : ${files.length - 1}` : "");

                if (type === "multiple") {
                    input.val(files.join(";"));
                }
            }

            function openModal() {
                $.get("/dashboard/files/list", function ({ status, result }) {
                    if (!status) return;

                    $("body").append(result);

                    const modal = $("#files-modal");
                    const message = modal.find("#files-message");

                    if (type === "multiple") {
                        selected.split(";").forEach(id => toggleSelection(modal, id));
                    } else {
                        toggleSelection(modal, selected);
                    }

                    modal.modal("show");

                    initializeDatatable();
                    initializeCustom();

                    modal.on("hidden.bs.modal", function () {
                        modal.remove();

                        if (init === "renew") openModal();

                        init = "new";
                    });

                    modal.on("click", ".files-select", function () {
                        const id = $(this).data("id");

                        if (type === "multiple") {
                            toggleSelection(modal, id);
                        } else {
                            input.val(id);

                            modal.modal("hide");
                        }
                    });

                    modal.on("click", "#files-create", function () {
                        $("#files-form").trigger("reset");

                        modal.find("#files-upload").toggleClass("d-none");
                        message.html("").attr("class", "alert");
                    });

                    modal.on("submit", "#files-form", function (e) {
                        e.preventDefault();

                        const formData = new FormData(this);

                        $.ajax({
                            url: "/dashboard/files/upload",
                            type: "POST",
                            contentType: false,
                            processData: false,
                            data: formData,
                            success: function (response) {
                                console.log(response);

                                message.removeClass("alert-danger m-3").addClass("alert-success m-3").text(response?.message || "");

                                init = "renew";

                                modal.modal("hide");
                            },
                            error: function (error) {
                                console.log(error);
                                message.removeClass("alert-success m-3").addClass("alert-danger m-3").text(error?.responseJSON?.message || "");
                            }
                        });
                    });
                });
            }

            openModal();
        });
    }

    function initializeCustom() {
        const hash = window.location.hash || $("#tabs .nav-link:first").attr("href");
        const appAlert = $("#app-alert");

        let alertTimeout;

        if (appAlert.length > 0) {
            clearTimeout(alertTimeout);

            alertTimeout = setTimeout(() => {
                appAlert.fadeOut(750);
            }, 10000);
        }

        $("[data-widget=mode]").on("click", function () {
            $("body").toggleClass("dark-mode");

            const is_dark = $("body").hasClass("dark-mode");

            localStorage.setItem("BAYTI:THEME", is_dark ? "dark" : "light");

            initializeMode();
        });

        function setActiveTab(tab) {
            $("#tabs .nav-link").removeClass("active").filter(`[href="${tab}"]`).addClass("active");
            $(".tab-pane").removeClass("active").filter(tab).addClass("active");
        }

        setActiveTab(hash);

        $("#tabs .nav-link").on("click", function () {
            var _target = $(this).attr("href");
            setActiveTab(_target);

            window.location.hash = _target;
        });

        $(".custom-file-input").on("change", function (event) {
            const file = event.target?.files[0]?.name || "-";
            $(this).next(".custom-file-label").html(file);
        });

        $(".table-responsive").overlayScrollbars({
            scrollbars: {
                autoHide: "move"
            },
        });
    }

    function initialize() {
        initializeMode();
        initializeDatatable();
        initializeComponents();
        initializeCustom();
    }

    initialize();
})();
