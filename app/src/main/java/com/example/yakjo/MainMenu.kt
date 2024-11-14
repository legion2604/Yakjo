package com.example.yakjo

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.util.Calendar

class MainMenu : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main_menu)
        val editTextDate = findViewById<EditText>(R.id.editTextDate)
        val calendar = Calendar.getInstance()

        editTextDate.setOnClickListener {
            val datePickerDialog = DatePickerDialog(
                this,
                R.style.CustomDatePickerDialog,
                { _, year, month, dayOfMonth ->
                    val selectedDate = "$dayOfMonth/${month + 1}/$year"
                    editTextDate.setText(selectedDate)
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            )
            val currentDate = calendar.timeInMillis
            datePickerDialog.datePicker.minDate =currentDate
            datePickerDialog.show()


        }
        val recyclerView: RecyclerView = findViewById(R.id.recyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)

        val items = listOf(
            Item("Jamoliddin", "150TJS","12:30","Dushanbe","16:30","Khujand"),
            Item("Jamoliddin", "100TJS","19:30","Panjakent","20:30","Tursunzoda"),
            Item("Jamoliddin", "90TJS","9:30","Dushanbe","12:30","Kulob")
        )
        val adapter = MyAdapter(items)
        recyclerView.adapter = adapter

    }
}
data class Item(val username: String, val price: String,val timeA: String,val cityA: String,val timeB: String,val cityB: String,)

class MyAdapter(private val itemList: List<Item>) : RecyclerView.Adapter<MyAdapter.ViewHolder>() {

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

        val userName: TextView = itemView.findViewById(R.id.userName)
        val price: TextView = itemView.findViewById(R.id.price)
        val timeA: TextView = itemView.findViewById(R.id.timeA)
        val cityA: TextView = itemView.findViewById(R.id.cityA)
        val timeB: TextView = itemView.findViewById(R.id.timeB)
        val cityB: TextView = itemView.findViewById(R.id.cityB)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.ad_desing, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = itemList[position]
        holder.userName.text = item.username
        holder.price.text = item.price
        holder.timeA.text = item.timeA
        holder.cityA.text = item.cityA
        holder.timeB.text = item.timeB
        holder.cityB.text = item.cityB
    }

    override fun getItemCount(): Int = itemList.size
}
