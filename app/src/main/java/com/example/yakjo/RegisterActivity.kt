package com.example.yakjo

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.example.yakjo.databinding.ActivityRegisterBinding

class RegisterActivity : AppCompatActivity() {
    private lateinit var mBuilding: ActivityRegisterBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)
        val getSMSbutton=findViewById<Button>(R.id.betSMSbutton)
        getSMSbutton.setOnClickListener(){
            val intent= Intent(this, EnterSmsKodeActivity::class.java)
            startActivity(intent)
        }
    }
    fun mahnoz(){
        println("mahnoz")
    }
}
