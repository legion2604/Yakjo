package com.example.yakjo


import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast

import androidx.appcompat.app.AppCompatActivity

class RegisterActivity : AppCompatActivity() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)
        val numberPhoneButton = findViewById<Button>(R.id.getSMSbutton)
        val numberPhone = findViewById<EditText>(R.id.numberPhone)
        numberPhoneButton.setOnClickListener {
            if (numberPhone.text.toString().trim().length==9) {
                val inputText = numberPhone.text.toString()
                val intent = Intent(this@RegisterActivity, EnterSmsCode::class.java)
                intent.putExtra("numberPhone", inputText)
                startActivity(intent)
            } else {
                Toast.makeText(this, "Пожалуйста, заполните поле правильно", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

