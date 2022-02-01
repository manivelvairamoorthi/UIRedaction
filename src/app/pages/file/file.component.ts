import { NgZone, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RepositoryService } from 'src/app/service/repository.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
// import { FileServiceService } from 'src/app/service/file-service.service';
import { async, from, interval } from 'rxjs';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

var globalExcelData: any[] = [];
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})

export class FileComponent implements OnInit {
  fileName = 'ExcelSheet.xlsx';

  file!: Blob;

  filelist: any
  croppopup: boolean = false;
  progressbarValue = 0;
  progress = 0;
  curSec: number = 0;
  files: any[] = [];
  getFileData: any[] = [];
  showExcel: boolean = false;
  excelData: any;
  columns: any[] = [];
  autoSave: boolean = false;
  previewtext: any;
  currentTextBox: any;
  filename: string = '';
  checkAll!: boolean;
  showAllCheck = true;
  redactbtn: boolean = false;
  loader: boolean = false;
  checkFileUploaded: boolean = false;
  filterSelectObj: any = [{}];
  selection: any[] = [];
  startDate: any;
  endDate: any;
  status: any;

  constructor(private ngZone: NgZone, private router: Router, private changeDef: ChangeDetectorRef, private repoService: RepositoryService,
    // private fileService: FileServiceService
  ) {
    this.filterSelectObj = [
      {
        name: 'file',
        columnProp: 'file',
        options: []
      }
    ];
  }
  ngOnInit() {
    this.getFiles();

  }
  displayedColumns: string[] = ['id', 'filename', 'filestatus', 'Uploaded_date', 'Last_modified_date', 'action'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {

  }
  openFileModal() {
    this.croppopup = true
  }

  toggleView() {
    this.showExcel = false
    this.columns = [];
    this.previewtext = null;
    this.currentTextBox = null;
    this.filename = '';
    this.autoSave = false;
  }

  redactFile(data: any) {
    console.log(data)
    this.loader = true;
    let tempData = {
      "file_id": data.id,
      "user_id": data["uploaded_by"]
    }
    this.repoService.autoRedact(tempData).subscribe((obj: any) => {
      this.loader = false;
      Swal.fire('Redacted Successfully');
      this.ngOnInit();
    }, (error) => {
      this.loader = false;
    })
  }
  filteredUser: any = [];
  idlFile: any = [];
  statusArray: any = [];
  sampleData: any = [];
  getFiles() {
    let tempStatusArry: any = []
    this.repoService.getAllExcelFile().subscribe((data: any) => {
      console.log('List of data' + data['data']);
      this.filteredUser = data['data'];
      for (let i = 0; i < data['data'].length; i++) {
        data['data'][i]["Uploaded_date"] = this.repoService.parseISOString(data['data'][i]["Uploaded_date"]);
        data['data'][i]["Last_modified_date"] = this.repoService.parseISOString(data['data'][i]["Last_modified_date"]);
        if (data['data'][i]['file_status'] == 1) {
          data['data'][i]['filestatus'] = "Idle"
        }
        else if (data['data'][i]['file_status'] == 2) {
          data['data'][i]['filestatus'] = "Redacted"
        }
        else if (data['data'][i]['file_status'] == 3) {
          data["data"][i].file_url = (data["data"][i].file_url).replace("unreviewed", "reviewed")
          data['data'][i]['filestatus'] = "Updated"
        }
        else {
          data['data'][i]['filestatus'] = "Please update file staus here"
        }
        data["data"][i].file_url = "http://localhost:8000" + data["data"][i].file_url;
        //data["data"][i].file_url = "http://35.227.150.208" + data["data"][i].file_url
        //http://35.227.150.208/uplod/redacted/file.xlsx
        tempStatusArry.push(data['data'][i].filestatus)
      }
      this.statusArray = [...new Set(tempStatusArry)];
      this.sampleData = data['data'];
      this.dataSource = new MatTableDataSource(data['data'].sort((a: number, b: number) => 0 - (a > b ? -1 : 1)));

      this.idlFile = data['data'].filter((element: { filestatus: string; }) => element.filestatus == "Idle");
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.filterSelectObj.filter((o: { options: any; columnProp: any; }) => {
        o.options = this.getFilterObject(data['data'], o.columnProp);
      });

      this.setDate(data['data'])
    })

  }

  clearDate(event: any) {
    event.stopPropagation();
    this.startDate = null;
    this.endDate = null;
    this.ngOnInit()
  }
  myFilter: any
  setDate(dates: any) {


    this.myFilter = (d: Date): boolean => {
      const testDates: Date[] = []
      let temp: any = [];
      dates.forEach((el: { uploaded_date: any | number | Date; }) => {
        if (!temp.includes(el.uploaded_date.split('T')[0])) {
          temp.push(el.uploaded_date.split('T')[0])
          testDates.push(new Date(el.uploaded_date))
        }
      });
      let data = testDates.findIndex(item => item.toDateString() == d.toDateString()) >= 0;
      //console.log(data)
      return data;
    }
    console.log(this.myFilter);

  }
  applyDateFilter(obj: string) {
    //alert(obj)
    this.dataSource.filter = obj
  }
  searchData: any = [];
  applyFilter(filterValue: string) {
    this.searchData = [];
    for (var i = 0; i < filterValue.length; i++) {
      for (var j = 0; j < this.sampleData.length; j++) {
        if (this.sampleData[j].filestatus == filterValue[i])
          this.searchData.push(this.sampleData[j])
      }
    }
    if (filterValue.length == 0) {
      this.dataSource = new MatTableDataSource(this.sampleData);
    }
    else {
      this.dataSource = new MatTableDataSource(this.searchData);
    }
  }
  fileFilter(filterValue: string) {
    this.searchData = [];
    for (var i = 0; i < filterValue.length; i++) {
      for (var j = 0; j < this.sampleData.length; j++) {
        if (this.sampleData[j].id == filterValue[i]) {
          this.searchData.push(this.sampleData[j])
        }
      }
    }
    if (filterValue.length == 0) {
      this.dataSource = new MatTableDataSource(this.sampleData);
    }
    else {
      this.dataSource = new MatTableDataSource(this.searchData);
    }

  }
  getFilterObject(fullObj: any[], key: string) {
    console.log("fullObj", fullObj);
    let resArr: any = [];

    fullObj.forEach(function (item) {
      console.log("item", item.id)

      var i = resArr.findIndex((x: { id: any; }) => x.id == item.id);
      if (i <= -1 && typeof item.id != 'undefined') {
        if (key == "file") {
          resArr.push({ id: item.id, name: item.filename });
        }
        //  else if(key == "status"){
        //   resArr.push({id: item.id, name: item.file_status});
        //  }

      }
    });
    console.log("filter", resArr)
    return resArr;
  }


  filterChange(filterType: any) {

    //start date start
    this.searchData = [];
    let dd = this.startDate.getDate();
    let mm = this.startDate.getMonth() + 1;
    let yyyy = this.startDate.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm++;
    }
    let startdate = yyyy + '-' + mm + '-' + dd;
    //start date end

    //end date start
    let enddd = this.endDate.getDate();
    let endmm = this.endDate.getMonth() + 1;
    let endyyyy = this.endDate.getFullYear();
    if (enddd < 10) {
      enddd = '0' + enddd;
    }
    if (endmm < 10) {
      endmm = '0' + endmm++;
    }
    let enddate = endyyyy + '-' + endmm + '-' + enddd;

    for (var j = 0; j < this.sampleData.length; j++) {
      const date = this.sampleData[j].Uploaded_date.split(" ")
      if (date[0] >= startdate && date[0] <= enddate) {
        this.searchData.push(this.sampleData[j])
      }
    }
    //end date end
    this.dataSource = new MatTableDataSource(this.searchData);

    // this.dataSource.filter = filterType
    // this.searchData=[];
    // this.searchData=this.sampleData.filter((ele: { Uploaded_date: number; })=>
    // ele.Uploaded_date>this.startDate &&
    // ele.Uploaded_date<this.endDate);
    // console.log(this.searchData)

  }

  applySearchFilters(filterValue: any) {
    filterValue = filterValue.value.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }



  onFileChange(event: any) {
    if (event.target != undefined) {
      for (var i = 0; i < event.target.files.length; i++) {
        if (event.target.files[i].name.split('.')[1] == "xlsx" || event.target.files[i].name.split('.')[1] == "csv") {
          const file_name = event.target.files[i].name;
          let validName = this.sampleData.filter((ele: { filename: any; }) => ele.filename == file_name);
          let validName2 = this.files.filter((ele: { name: any; }) => ele.name == file_name);
          if (validName.length == 0 && validName2.length == 0) {
            this.files.push(event.target.files[i]);
          } else {
            Swal.fire('file name already exist', '', 'error')
          }
        }
        else {
          Swal.fire('please upload excel only', '', 'error')
        }
      }
      this.checkFileUploaded = true;
    }
    else {
      let data = Object.keys(event).map(key => event[key]);
      for (var i = 0; i < data.length; i++) {
        var exte = data[i].name.split('.').pop();

        if (exte == "xlsx" || exte == 'csv') {
          let validName = this.sampleData.filter((ele: { filename: any; }) => ele.filename == data[i].name);
          let validName2 = this.files.filter((ele: { name: any; }) => ele.name == data[i].name);
          if (validName.length == 0 && validName2.length == 0) {
            this.files.push(data[i]);
          }
          else {
            Swal.fire('file name already exist', '', 'error')
          }
          this.checkFileUploaded = true;
        }
        else {
          Swal.fire('please upload excel only', '', 'error')
        }

      }
    }
    /* this.progress = 5;
    let seconds = 60;
    const time = seconds;
    const timer$ = interval(50);
    const sub = timer$.subscribe((sec) => {
      this.progressbarValue = 0 + sec * 100 / seconds;
      this.curSec = sec;
      if (this.curSec == 100) {
        sub.unsubscribe();
        this.progress = 0;
        this.curSec = 0;
        seconds = 0;
        this.progressbarValue = 0;
        
      }
    }); */

  }

  deleteFromArray(index: any) {
    this.files.splice(index, 1);
    console.log(this.files.length)
    if (this.files.length == 0) {
      this.checkFileUploaded = false;
    }
  }
  cancel() {
    this.croppopup = false;
    this.files = [];
  }
  uploadfunction() {
    const formData = new FormData();
    for (let i = 0; i < this.files.length; i++) {
      formData.append("file", this.files[i]);
    }
    formData.append("uploaded_by", this.repoService.user().id);

    this.repoService.uploadExcelFile(formData).subscribe(data => {
      Swal.fire('Successfully Added!', '', 'success');
      this.getFiles();

      //this.files = [];
      this.cancel();
      this.router.navigate(['/file']);
    })
  }

  test: any = []
  compare(data: any) {
    //this.autoSave=false;
    this.excelData = [];
    this.columns = [];
    this.test = data
    this.showExcel = true;
    this.filename = data.id;
    let temp = {
      "file_id": data.id,
    }

    this.repoService.compareExcel(temp).subscribe((data: any) => {
      console.log(data)

      for (let i = 0; i < data.data.length; i++) {
        for (let u = 0; u < data.data[i]["Redacted line"].length; u++) {
          this.excelData.push({
            'Unredacted lines': data.data[i]["Unredacted lines"][u],
            'Redacted line': data.data[i]["Redacted line"][u]
          });
        }
      }
      console.log(this.excelData)
      let temp1 = Object.keys(this.excelData[0])
      for (let a = 0; a < temp1.length; a++) {
        this.columns.push({
          id: temp1[a],
          label: temp1[a].toString().toUpperCase()
        })
      }
      globalExcelData = this.excelData;
    })

    /* let fileReader = new FileReader();
    fetch(data.file_url).then(res => res.blob()).then(blob => {
      this.file = blob;
      console.log(this.file);
      fileReader.readAsArrayBuffer(this.file);
    })

    fileReader.onload = (e) => {
      let arrayBuffer: any;
      arrayBuffer = fileReader.result;
      var data = new Uint8Array(arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      console.log(XLSX.utils.sheet_to_html(worksheet))
      this.excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
      let temp1 = Object.keys(this.excelData[0])
      for (let a = 0; a < temp1.length; a++) {
        this.columns.push({
          id: temp1[a],
          label: temp1[a].toString().toUpperCase()
        })
      }
      globalExcelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
    } */
  }

  saveAll() {
    console.log("save allllllllll", this.excelData);
    let fileDetails = { "File_id": this.test.id, "User_id": this.test["uploaded by"] };
    this.repoService.saveExcel(this.excelData, fileDetails).subscribe((obj: any) => {
      Swal.fire('File Saved');
    })
  }

  restoreAll() {
    this.compare(this.test);
  }
  enableAutoSave() {
    this.autoSave = this.autoSave ? true : false
  }
  previewtextfun(text: any) {
    this.previewtext = text.value
    this.currentTextBox = text
  }
  changePriewtext() {
    this.currentTextBox.value = this.previewtext
  }

  deleteUser(data: any) {
    let id = { "file_id": data.id }
    Swal.fire({
      title: 'Do you want to delete this file?',
      showCancelButton: true,
      confirmButtonText: `Yes`,
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.repoService.deleteFile(id).subscribe(data => {
          this.ngOnInit();
          Swal.fire('Successfully Delete', '', 'success');
          this.getFiles();
        });
      }
    });
  }
  //check box start
  fileids: any = [];
  toggle(item: any, event: MatCheckboxChange) {
    if (event.checked) {
      this.fileids.push(item);
      if (this.fileids.length == this.idlFile.length) {
        this.checkAll = true;
      }
    } else {
      const index = this.fileids.indexOf(item);
      if (index >= 0) {
        this.fileids.splice(index, 1);
        this.checkAll = false;
      }
    }
    if (this.fileids.length >= 1) {
      this.redactbtn = true;
    }
    else {
      this.redactbtn = false;
      event.checked;
    }
  }


  exists(item: any) {

    return this.fileids.indexOf(item) > -1;
  }


  toggleAll(event: MatCheckboxChange) {

    if (event.checked) {
      this.filteredUser.forEach((row: { file_status: any; }) => {
        if (row.file_status == "Idle") {
          this.fileids.push(row);
          this.redactbtn = true;
        }
      });
    }
    else {
      this.fileids = []
      this.redactbtn = false;
    }
  }

  Download(data: any) {
  
    this.loader = true;
    this.excelData = [];
    let temp = {
      "file_id": data.id,
    }
    
    const filename=data.filename.split(".");
    this.repoService.compareExcel(temp).subscribe((data: any) => {
      this.loader = false;
      for (let i = 0; i < data.data.length; i++) {
        for (let u = 0; u < data.data[i]["Redacted line"].length; u++) {
          this.excelData.push({
            'Unredacted lines': data.data[i]["Unredacted lines"][u],
            'Redacted line': data.data[i]["Redacted line"][u]
          });
        }
      }
      this.exportAsExcelFile(this.excelData, filename[0]);
    });
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, excelFileName + EXCEL_EXTENSION);
  }
}


const today = new Date()


function form(filterType: any) {
  throw new Error('Function not implemented.');
}