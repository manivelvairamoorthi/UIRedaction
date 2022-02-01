import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RepositoryService } from 'src/app/service/repository.service';
import * as _ from 'lodash';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {



  public graph: any = {

    data: [

      { x: [], y: [], type: 'bar', name: 'Uploaded files', },
      { x: [], y: [], type: 'bar', name: 'Redacted files', },
      { x: [], y: [], type: 'bar', name: 'Updated files', },

    ],

    layout: {
      width: 1050, height: 350,
      xaxis: { type: 'date' },
      //yaxis: {range: [0, 4]}

    }

  };
  globalFileData: any;

  constructor(private service: RepositoryService) { }

  displayedColumns: string[] = ['file_uploaded', 'file_Redacted', 'file_updated', 'row_count'];
  dataSource = new MatTableDataSource();
  fileData: any = [];
  temp: any = { file_count: "", row_count: "" };
  zoomOption: String[] = ['7D', '15D', '1M', '3M', '6M'];
  startDate: any;
  endDate: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  totalData: any = { date: "", file_uploaded: "", file_Redacted: "", file_updated: "", row_count: "" }
  tableData: any = [];
  count: any = []
  pagination: boolean = false;
  month_data = [];
  ngOnInit(): void {

    this.service.redactCount().subscribe(res => {
      this.fileData=res['date_data'];
      this.month_data = res['month_data']
      for(let i=0; i<this.fileData.length; i++){
        this.fileData[i]["date"]= new Date(this.fileData[i]["Date"])
      }
      this.globalFileData = this.fileData.slice(0);
      this.getValue('onInit', '7D');
      //total count start
      this.totalData.file_uploaded = this.fileData.map((t: { file_uploaded: any; }) => t.file_uploaded).reduce((acc: any, value: any) => acc + value, 0);
      this.totalData.file_Redacted = this.fileData.map((t: { file_Redacted: any; }) => t.file_Redacted).reduce((acc: any, value: any) => acc + value, 0);
      this.totalData.file_updated = this.fileData.map((t: { file_updated: any; }) => t.file_updated).reduce((acc: any, value: any) => acc + value, 0);
      this.totalData.row_count = this.fileData.map((t: { row_count: any; }) => t.row_count).reduce((acc: any, value: any) => acc + value, 0);
      this.tableData.push(this.totalData)
      this.tableDatas(this.tableData)
      //total count end
    });


  }
  getTotalCost() {
    return this.count.map((t: { row_count: any; }) => t.row_count).reduce((acc: any, value: any) => acc + value, 0);
  }

  getValue(data: any, type:string) {
    console.log("data", data)
    if (data != "onInit") {
      this.fileData = data;
    }
    let trace1: any = {
      x: [],
      y: [],
      type: 'bar',
      name: 'uploaded files'
    };
    let trace2: any = {
      x: [],
      y: [],
      type: 'bar',
      name: 'Redacted files'
    };
    let trace3: any = {
      x: [],
      y: [],
      type: 'bar',
      name: 'updated files'
    };
    if(type=="7D" || type=="15D"){
      this.fileData.forEach(function (val: any) {
        trace1.x.push(val['date']);
        trace1.y.push(val['file_uploaded']);
        trace2.x.push(val['date']);
        trace2.y.push(val['file_Redacted']);
        trace3.x.push(val['date']);
        trace3.y.push(val['file_updated']);
      })
     
      this.graph.layout['xaxis']['type']='date';
    }else {
      data.forEach((val:any) => {
        trace1.x.push(val['Month']);
        trace1.y.push(val['file_uploaded']);
        trace2.x.push(val['Month']);
        trace2.y.push(val['file_Redacted']);
        trace3.x.push(val['Month']);
        trace3.y.push(val['file_updated']);
      });
      this.graph.layout['xaxis']['type']='category';
    }
    this.graph.data = [];
    this.graph.data.push(trace1);
    this.graph.data.push(trace2);
    this.graph.data.push(trace3);
    console.log("graph ", this.graph)
  }

  zoomFilter(data: any) {
    this.fileData = this.globalFileData;
    let months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    if (data == '7D') {
      let startdate = new Date();
      let enddate: any = new Date()
        .setDate(new Date().getDate() - 7);
      enddate = new Date(enddate);
      let temp = this.fileData.filter((f: any) => f.date > enddate && f.date < startdate)
      this.getValue(temp, data);
      this.tableDatas(temp)
    }
    else if (data == '15D') {
      let startdate = new Date();
      let enddate: any = new Date().setDate(new Date().getDate() - 15);
      enddate = new Date(enddate);
      let temp = this.fileData.filter((f: any) => f.date > enddate && f.date < startdate)
      this.getValue(temp, data);
      this.tableDatas(temp)
    }
    else if (data == '1M') {
      let startdate = new Date();
      let temp:any = [];
      this.month_data.forEach((element:any) => {
        console.log(element['Month']==startdate.getMonth()+1+"-"+startdate.getFullYear(), element['Month'],"==",startdate.getMonth()+1+"-"+startdate.getFullYear())
        if(element['Month']==startdate.getMonth()+1+"-"+startdate.getFullYear())
          temp.push(element)
      });
      console.log("tes", temp)
      this.getValue(temp, data);
      this.tableDatas(temp)
    }
    else if (data == '3M') {
      let current = new Date();
      let c_temp= (("0"+(current.getMonth()+1)).slice(-2))+"-"+current.getFullYear();
      let current_1 = new Date();
      current_1.setMonth(current.getMonth()-1)
      let c1_temp= (("0"+(current_1.getMonth()+1)).slice(-2))+"-"+current.getFullYear();
      let current_2 = new Date();
      current_2.setMonth(current.getMonth()-2)
      let c2_temp= (("0"+(current_2.getMonth()+1)).slice(-2))+"-"+current.getFullYear();

      let temp:any = [];
      this.month_data.forEach((element:any) => {
        if((element['Month'] == (c_temp)) || (element['Month'] == (c1_temp))|| (element['Month'] == (c2_temp))){
            temp.push(element)
        }
      });
      this.getValue(temp, data);
      this.tableDatas(temp)
    }
    else if (data == '6M') {
      let current = new Date();
      let c_temp= (("0"+(current.getMonth()+1)).slice(-2))+"-"+current.getFullYear();
      let current_1 = new Date();
      current_1.setMonth(current.getMonth()-1)
      let c1_temp= (("0"+(current_1.getMonth()+1)).slice(-2))+"-"+current.getFullYear();
      let current_2 = new Date();
      current_2.setMonth(current.getMonth()-2)
      let c2_temp= (("0"+(current_2.getMonth()+1)).slice(-2))+"-"+current.getFullYear();
      let current_3 = new Date();
      current_3.setMonth(current.getMonth()-3)
      let c3_temp= (("0"+(current_3.getMonth()+1)).slice(-2))+"-"+current.getFullYear();
      let current_4 = new Date();
      current_4.setMonth(current.getMonth()-4)
      let c4_temp= (("0"+(current_4.getMonth()+1)).slice(-2))+"-"+current.getFullYear();
      let current_5 = new Date();
      current_5.setMonth(current.getMonth()-5)
      let c5_temp= (("0"+(current_5.getMonth()+1)).slice(-2))+"-"+current.getFullYear();
      
      let temp:any = [];
      this.month_data.forEach((element:any) => {
        if((element['Month']== c_temp) || (element['Month']== c1_temp) || (element['Month']== c2_temp) || 
           (element['Month']== c3_temp) || (element['Month']== c4_temp)|| (element['Month']== c5_temp)){
          temp.push(element)
        }
      });
      this.getValue(temp, data);
      this.tableDatas(temp)
    }
    else if (data == '1Y') {
      let startdate = new Date();
      let enddate: any = new Date().setMonth(new Date().getMonth() - 12);
      enddate = new Date(enddate);
      let temp = this.fileData.filter((f: any) => f.date > enddate && f.date < startdate)
      this.getValue(temp, data);
      this.tableDatas(temp)
    }
    else {
      this.getValue(this.globalFileData, '7D')
    }
  }

  dateFilter() {
    this.fileData = this.globalFileData;
    let temp = this.fileData.filter((f: any) => f.date >= this.startDate && f.date <= this.endDate)
    this.getValue(temp, '7D');
    this.tableDatas(temp);

  }
  tableDatas(temp: any) {

    if (temp.length == 1) {
      this.pagination = false;
    }
    else {
      this.pagination = true;
    }
    this.dataSource = new MatTableDataSource(temp);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

}

