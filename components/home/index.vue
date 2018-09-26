<template>
	<h1>This is the <span>{{pageName}}</span> page.</h1>
</template>

<script>
export default {
	name: "home",
	data() {
		return {
			pageName: "home"
		}
	}
}
</script>

<style lang="scss" scoped>
h1 {
	color: #333333;
	text-align: center;
	margin-top: 50px;
	span {
		color: #68b1ed;
	}
}
</style>