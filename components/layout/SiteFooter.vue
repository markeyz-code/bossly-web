<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next';
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-line bg-forest-900 text-[#E8EFE9]">
    <div class="shell py-14">
      <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <LogoMark dark />
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-[#A8C0B4]">The business management system for student entrepreneurs in Nigeria. Run the business. We build the website.</p>
          <a href="https://wa.me/2348000000000" target="_blank" rel="noopener" class="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-bold text-white">
            <MessageCircle class="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7C9989]">Product</p>
          <a href="#features" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Features</a>
          <a href="#templates" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Storefronts</a>
          <a href="#pricing" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Pricing</a>
          <NuxtLink to="/register" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Start free</NuxtLink>
        </div>
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7C9989]">Company</p>
          <a href="#faq" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">FAQ</a>
          <NuxtLink to="/login" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">Sign in</NuxtLink>
          <a href="mailto:hello@bossly.ng" class="block py-1.5 text-sm text-[#C7D8CE] hover:text-white">hello@bossly.ng</a>
        </div>
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7C9989]">For students</p>
          <p class="text-sm leading-relaxed text-[#C7D8CE]">Free to start.<br>No card needed.<br>Built for Nigerian data.</p>
        </div>
      </div>
      <div class="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#7C9989] sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ year }} Bossly. Made for hustlers, not corporations.</p>
        <p>Naira first. WhatsApp native. Student approved.</p>
      </div>
    </div>
  </footer>
</template>
