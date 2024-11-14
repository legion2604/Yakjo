package com.example.yakjo

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class Registration : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_registration)
        val passangerChekBox=findViewById<CheckBox>(R.id.checkBoxPassanger)
        val driverChekBox=findViewById<CheckBox>(R.id.checkBoxDriver)

        passangerChekBox.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                driverChekBox.isChecked = false
            }
        }
        driverChekBox.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                passangerChekBox.isChecked = false
            }
        }
        val buttonRegistration=findViewById<Button>(R.id.buttonRegister)
        buttonRegistration.setOnClickListener{
            val intent=Intent(this@Registration,MainMenu::class.java)
            startActivity(intent)
        }
    }
}