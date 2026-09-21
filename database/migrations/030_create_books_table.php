<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('isbn')->unique()->nullable();
            $table->string('author');
            $table->string('publisher')->nullable();
            $table->string('edition')->nullable();
            $table->year('publication_year')->nullable();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->integer('total_copies');
            $table->integer('available_copies');
            $table->string('shelf_location')->nullable();
            $table->string('cover_image')->nullable();
            $table->decimal('price', 8, 2)->nullable();
            $table->enum('status', ['available', 'out_of_stock'])->default('available');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('isbn');
            $table->index('category');
            $table->index('status');
            $table->fullText(['title', 'author']);
        });
    }
    public function down(): void { Schema::dropIfExists('books'); }
};
