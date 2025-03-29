<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ShopItem;

class ShopItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $parents = User::whereDoesntHave('roles', fn($q) => $q->where('name', 'Developer'))->get();
        // Or: $parents = User::all();

        foreach ($parents as $parent) {
            // Create standard items
            ShopItem::factory()->count(5)->recycle($parent)->create();
            // Create a limited time item
            ShopItem::factory()->limitedTime()->recycle($parent)->create();
        }
    }
}
