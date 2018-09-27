<template>
	<div>
		<header>{{pageName}}</header>
		<div class="home-container flex flex-column justify-center align-center">
			<img src="../../images/vue.jpg" alt="" />
			<p>{{message}}</p>
			<p style="color:#666666;font-size:15px;">This project is created by vue-app.</p>
		</div>
	</div>
</template>

<script>
import common from "@/js/common";
export default {
	name: "home",
	data() {
		return {
			pageName: "home",
			message: common.message
		}
	}
}
</script>

<style lang="scss" scoped>
.home-container {
	padding-top: 50px;
	height: 100vh;
	img {
		width: 150px;
		height: 150px;
	}
	p {
		font-size: 20px;
		color: #333333;
		text-align: center;
		margin: 15px 0 0 0;
	}
}
</style>